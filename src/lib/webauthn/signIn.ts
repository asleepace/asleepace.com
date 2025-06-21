import type { User } from '@/db/types'
import { randomBytes, createHash, createVerify } from 'node:crypto'
import { decodeAuthenticatorData, deocdeBase64JSON } from './utils'
import { Credentials } from '@/db'

const RP_ID = process.env.WEBAUTHN_RP_ID
const FIVE_MINUTES = 5 * 60 * 1000
const WEBAUTHN_ORIGIN = 'localhost'

const hashSha256 = (data: string): Uint8Array => {
  return new Uint8Array(createHash('sha256').update(data, 'utf-8').digest())
}

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
      const challange = randomBytes(16).toBase64({
        alphabet: 'base64url',
        omitPadding: true,
      })
      store.set(challange, {
        expires: Date.now() + FIVE_MINUTES,
      })
      this.cleanup()
      return challange
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
async function verifySignature(props: {
  authenticatorDataBuffer: Buffer
  clientDataJSON: string
  signature: string
  publicKey: Buffer // Assuming DER format
}) {
  try {
    const verifier = createVerify('sha256')
    const clientDataHash = hashSha256(props.clientDataJSON)
    const authDataLenth = props.authenticatorDataBuffer.length
    const totalLength = authDataLenth + clientDataHash.length
    const signedData = new Uint8Array(totalLength)

    signedData.set(props.authenticatorDataBuffer, 0)
    signedData.set(clientDataHash, authDataLenth)
    verifier.update(signedData)

    const signatureBytes = new Uint8Array(Buffer.from(props.signature, 'base64url'))

    return verifier.verify(
      {
        key: props.publicKey,
        format: 'der',
        type: 'spki',
      },
      signatureBytes
    )
  } catch (e) {
    console.warn('[webauthn][signin] error verifying signature:', e)
    return false
  }
}

/**
 *  The second stage in the sign-in process which checks if the same challenge is present,
 *  and then extracts the `userHandle` property from the public key credential json. This
 *  is then used to find a user in the backend.
 */
export async function completeSignInChallenge({ response }: PublicKeyCredentialJSON): Promise<User> {
  if (!RP_ID || typeof RP_ID !== 'string') throw new Error('Missing RP_ID environment variable.')

  // Step #1: decode client data
  const clientData = deocdeBase64JSON(response.clientDataJSON)
  console.log('[webauthn][signin] clientData:', clientData)

  // Step #2: verify challenge from `startSignInChallenge`
  const isValid = challenges.validate(clientData.challenge)
  if (!isValid) throw new Error('Failed validation')

  // Step #3: verify origin
  if (clientData.origin !== WEBAUTHN_ORIGIN) {
    throw new Error('Origin mismatch!')
  }

  // Step #4: verify type
  if (clientData.type !== 'webauthn.get') {
    throw new Error('Invalid ceremony type!')
  }

  // Step #5: decode authenticator data
  const authenticatorData = decodeAuthenticatorData(response)
  console.log('[WebAuthN] authenticatorData:', authenticatorData)

  // Step #6: verify user flags for present and verified
  if (!authenticatorData.flags.userPresent) {
    throw new Error('User not present')
  }
  if (!authenticatorData.flags.userVerified) {
    throw new Error('User not verified')
  }

  // Step #7: verify RP_ID hashes
  const expectedRpIdHash = new Uint8Array(hashSha256(RP_ID))
  if (!authenticatorData.rpIdHash.equals(expectedRpIdHash)) {
    throw new Error('Mismatched relaying party ID.')
  }

  // Step #8: verify user handle is present
  const { userHandle } = response
  if (!userHandle || typeof userHandle !== 'string') {
    throw new Error('Invalid user handle.')
  }
  console.log('[WebAuthN] userHandle:', userHandle)

  // Step #9: find user by their userHandle (non-identifying)
  const user = Credentials.getUserByHandle({ userHandle })
  if (!user) throw new Error('Failed to find user for passkey')

  // Step #10: find user credentials by the credential id
  const credential = Credentials.getCredentialById({
    credentialId: response.id,
    userId: user.id,
  })
  if (!credential) throw new Error('Missing credentials!')

  // Step #11: verify the signed credentials match

  const isVerified = await verifySignature({
    clientDataJSON: response.clientDataJSON,
    authenticatorDataBuffer: authenticatorData.buffer,
    publicKey: Buffer.from(credential.publicKey),
    signature: response.signature,
  })

  if (!isVerified) throw new Error('Failed verification')

  // Step #12: update the signed counter
  Credentials.updateCredentialCounter({
    credentialId: credential.id,
    counter: authenticatorData.signCount,
  })

  return user
}
