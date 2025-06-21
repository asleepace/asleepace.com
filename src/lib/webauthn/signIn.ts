import type { User } from '@/db/types'
import { randomBytes, createHash, createVerify } from 'node:crypto'
import { decodeAuthenticatorData, decodeBase64JSON, type ClientDataJSON, type WebAuthNAuthenticatorData } from './utils'
import { Credentials } from '@/db'

const RP_ID: string = process.env.WEBAUTHN_RP_ID!
const FIVE_MINUTES = 5 * 60 * 1000
const WEBAUTHN_ORIGIN = 'localhost'

const hashSha256 = (data: string) => {
  return createHash('sha256').update(data, 'utf-8').digest()
}

const RP_ID_HASH = new Uint8Array(hashSha256(RP_ID))

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
        expires: Date.now() + FIVE_MINUTES,
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
  rpId: RP_ID,
})

/**
 *  Verify cryptographic signature by comparing the
 */
function verifySignature(props: {
  authenticatorDataBuffer: Buffer
  clientDataJSON: string
  signature: string
  publicKey: Buffer // Assuming DER format
}) {
  const verifier = createVerify('sha256')
  const clientDataHash = hashSha256(props.clientDataJSON)
  const authDataLength = props.authenticatorDataBuffer.length
  const totalLength = authDataLength + clientDataHash.length
  const signedData = new Uint8Array(totalLength)

  signedData.set(props.authenticatorDataBuffer, 0)
  signedData.set(clientDataHash, authDataLength)
  verifier.update(signedData)

  const signatureBytes = new Uint8Array(Buffer.from(props.signature, 'base64url'))

  const isVerified = verifier.verify(
    {
      key: props.publicKey,
      format: 'der',
      type: 'spki',
    },
    signatureBytes
  )

  if (!isVerified) {
    throw new Error('Authenticator verification failed')
  }
}

interface WebAuthNResponse {
  id: string
  userHandle: string
  clientDataJSON: string
  signature: string
}

interface WebAuthNSignIn {
  response: WebAuthNResponse
}

/**
 *  Verify the client data matches the expected values.
 */
const verifyClientData = (clientData?: ClientDataJSON): true | never => {
  if (!clientData || typeof clientData !== 'object') {
    throw new Error('Authenticator client data invalid.')
  }
  if (clientData.origin !== WEBAUTHN_ORIGIN) {
    throw new Error('Authenticator origin mismatch.')
  }
  if (clientData.type !== 'webauthn.get') {
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
const verifyAuthenticatorData = (response: WebAuthNResponse) => {
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
  if (!authenticatorData.rpIdHash.equals(RP_ID_HASH)) {
    throw new Error('Authenticator relaying party mismatch.')
  }

  return authenticatorData
}

/**
 *  Find saved user and credential from databased.
 */
const findUserWithCredentialsByHandle = ({ userHandle, id: credentialId }: WebAuthNResponse) => {
  if (!userHandle || typeof userHandle !== 'string') {
    throw new Error('Authenticator invalid user handle.')
  }
  if (!credentialId || typeof credentialId !== 'string') {
    throw new Error('Authenticator invalid credential id.')
  }

  const user = Credentials.getUserByHandle({ userHandle })

  if (!user || !user.id) {
    throw new Error('Authenticator user not found.')
  }

  const credential = Credentials.getCredentialById({
    userId: user.id,
    credentialId,
  })

  if (!credential) {
    throw new Error('Authenticator credentials not found.')
  }

  return { user, credential }
}

/**
 *  The second stage in the sign-in process which checks if the same challenge is present,
 *  and then extracts the `userHandle` property from the public key credential json. This
 *  is then used to find a user in the backend.
 */
export async function completeSignInChallenge(signInCredential: WebAuthNSignIn): Promise<User> {
  if (!RP_ID || typeof RP_ID !== 'string') throw new Error('Missing RP_ID environment variable.')
  const { response } = signInCredential

  console.log('[webauthn][signin] credential:', signInCredential)

  // Step #1: decode client data
  const clientData = decodeBase64JSON<ClientDataJSON>(response.clientDataJSON)
  console.log('[webauthn][signin] clientData:', clientData)

  // Step #2: verify client data
  verifyClientData(clientData)

  // Step #3: verify authenticator data
  const authenticatorData = verifyAuthenticatorData(response)

  // Step #4: find saved user and credential
  const { user, credential } = findUserWithCredentialsByHandle(response)

  // Step #5: check if the counter is out-of-sync
  if (authenticatorData.signCount <= credential.counter) {
    throw new Error('Authenticator potential replay attack detected.')
  }

  // Step #6: verify the signed credentials match
  verifySignature({
    clientDataJSON: response.clientDataJSON,
    authenticatorDataBuffer: authenticatorData.buffer,
    publicKey: Buffer.from(credential.publicKey),
    signature: response.signature,
  })

  // Step #13: update the signed counter
  Credentials.updateCredentialCounter({
    credentialId: credential.id,
    counter: authenticatorData.signCount,
  })

  return user
}
