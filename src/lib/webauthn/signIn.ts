import type { User } from '@/db/'
import { randomBytes, createVerify, createPublicKey } from 'node:crypto'
import {
  decodeAuthenticatorData,
  decodeBase64,
  decodeBase64JSON,
  hashSha256,
  WebAuthN,
  type ClientDataJSON,
} from './utils'
import { Credentials } from '@/db'

/**
 *  Creates a new in-memory store for sign-in challenges.
 */
function createSignInChallengeStore() {
  const store = new Map<string, { expires: number }>()
  return {
    validate(clientChallenge: string): boolean | never {
      if (!clientChallenge) throw new Error('Invalid client challenge!')
      const found = store.get(clientChallenge)
      if (!found || found.expires < Date.now()) {
        throw new Error('Invalid or expired credential.')
      }
      store.delete(clientChallenge)
      return true
    },
    generate(): string {
      const challenge = randomBytes(16).toBase64({
        alphabet: 'base64url',
        omitPadding: true,
      })
      store.set(challenge, {
        // expires in 5 minutes...
        expires: Date.now() + WebAuthN.RP_TIMEOUT,
      })
      this.cleanup()
      return challenge
    },
    cleanup(): void {
      const now = Date.now()
      for (const [challenge, data] of store) {
        if (data.expires < now) {
          store.delete(challenge)
        }
      }
    },
  }
}

/**
 *  In-memory store of sign-in challenges used to verify authenticator data.
 */
const challenges = createSignInChallengeStore()

/**
 *  Start a new sign-in attempt with WebAuthN by generating a random challenge and
 *  adding it to the `signInChallenge` set. This is a two part process and will be
 *  check in the `completeSignInChallenge` method.
 */
export const startSignInChallenge = (): PublicKeyCredentialRequestOptionsJSON => ({
  challenge: challenges.generate(),
  userVerification: 'required',
  allowCredentials: [],
  timeout: 60_000,
  rpId: WebAuthN.RP_ID,
})

/**
 *  ## WebAuthN: Verify Signature
 *
 *  Verify cryptographic signature by comparing the SHA-256 of the client data to the
 *  provided signature using the public key.
 *
 *  @note `clientDataJSON` prop is base64 encoded JSON data from the authenticator.
 */
function verifyWebAuthNSignature({
  authenticatorDataBuffer,
  clientDataJSON,
  signature,
  publicKey,
}: {
  authenticatorDataBuffer: Buffer
  clientDataJSON: string
  signature: string
  publicKey: string
}): void {
  const signedData = Buffer.concat([
    new Uint8Array(authenticatorDataBuffer),
    new Uint8Array(hashSha256(decodeBase64(clientDataJSON))),
  ])

  const verified = createVerify('sha256')
    .update(new Uint8Array(signedData))
    .verify(
      createPublicKey({ key: Buffer.from(publicKey, 'base64'), format: 'der', type: 'spki' }),
      new Uint8Array(Buffer.from(signature, 'base64url'))
    )

  if (!verified) throw new Error('Signature verification failed')
}

interface SignInResponse {
  id: string
  userHandle: string
  clientDataJSON: string
  signature: string
}

interface SignInCredential {
  authenticatorAttachment: string | 'platform'
  clientExtensionResults: object
  id: string
  rawId: string
  response: SignInResponse
}

/**
 *  Verify the client data matches the expected values.
 */
const verifyClientData = (clientData?: ClientDataJSON): true | never => {
  if (!clientData || typeof clientData !== 'object') {
    throw new Error('Authenticator client data invalid.')
  }
  if (clientData.origin !== WebAuthN.RP_ORIGIN) {
    throw new Error('Authenticator origin mismatch.')
  }
  if (clientData.type !== WebAuthN.GetType) {
    throw new Error('Authenticator type mismatch.')
  }
  if (!challenges.validate(clientData.challenge)) {
    throw new Error('Authenticator failed challenge.')
  }
  return true
}

/**
 *  Verify the authenticator data matches the expected data.
 */
const verifyAuthenticatorData = (response: SignInResponse) => {
  const authenticatorData = decodeAuthenticatorData(response)
  if (!authenticatorData || typeof authenticatorData !== 'object') {
    throw new Error('Authenticator data invalid.')
  }
  if (!authenticatorData.flags.userPresent) {
    throw new Error('Authenticator user not present!')
  }
  if (!authenticatorData.flags.userVerified) {
    throw new Error('Authenticator user not verified.')
  }
  if (!authenticatorData.rpIdHash.equals(WebAuthN.RP_ID_HASH)) {
    throw new Error('Authenticator relaying party mismatch.')
  }
  return authenticatorData
}

/**
 *  Find saved user and credential from databased.
 */
const findCredentialsById = ({ credentialId }: { credentialId: string }) => {
  if (!credentialId || typeof credentialId !== 'string') {
    throw new Error('Authenticator invalid credential id.')
  }
  const credential = Credentials.getCredentialById({
    credentialId,
  })
  if (!credential) {
    throw new Error('Authenticator credentials not found.')
  }
  return { credential }
}

/**
 *  The second stage in the sign-in process which checks if the same challenge is present,
 *  and then extracts the `userHandle` property from the public key credential json. This
 *  is then used to find a user in the backend.
 */
export async function completeSignInChallenge({ response, id: credentialId }: SignInCredential): Promise<User> {
  // Step #1: decode client data
  const clientData = decodeBase64JSON<ClientDataJSON>(response.clientDataJSON)

  // Step #2: verify client data
  verifyClientData(clientData)

  // Step #3: verify authenticator data
  const authenticatorData = verifyAuthenticatorData(response)
  console.log('[webauthn][signin] authenticator data:', authenticatorData)

  // Step #4: find saved user and credential
  const { credential } = findCredentialsById({ credentialId })

  // Step #5: check if the counter is out-of-sync (if supported)
  if (authenticatorData.signCount !== 0 || credential.counter !== 0) {
    if (authenticatorData.signCount <= credential.counter) {
      throw new Error('Authenticator potential replay attack detected.')
    }
  }

  // Step #6: verify the signed credentials match
  verifyWebAuthNSignature({
    clientDataJSON: response.clientDataJSON,
    authenticatorDataBuffer: authenticatorData.buffer,
    publicKey: credential.publicKey,
    signature: response.signature,
  })

  // Step #7: update the signed counter
  Credentials.updateCredentialCounter({
    credentialId: credential.id,
    counter: authenticatorData.signCount,
  })

  // Step #8: fetch user from handle
  const user = Credentials.getUserByHandle({
    userHandle: credential.userHandle,
  })

  if (!user) throw new Error('Authenticator failed to load user!')

  return user
}
