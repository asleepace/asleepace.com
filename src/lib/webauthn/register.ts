import type { User } from '@/db/types'
import { randomBytes } from 'node:crypto'
import { decodeAuthenticatorData, decodeBase64JSON, hashSha256, WebAuthN, type ClientDataJSON } from './utils'
import { Credentials } from '@/db'

/**
 *  Create a unique random non-PII userHandle for the user.
 */
const createUserHandle = () =>
  randomBytes(16).toBase64({
    alphabet: 'base64url',
    omitPadding: true,
  })

/**
 *  Create a store which manages creating the registration challenges and
 *  generating unique non-PII user handles.
 */
function createRegistrationChallengeStore() {
  const store = new Map<string, { expires: number; userHandle: string }>()
  return {
    validate(clientChallenge: string): string | never {
      if (!clientChallenge) throw new Error('Invalid client challenge!')
      const found = store.get(clientChallenge)
      if (!found || found.expires < Date.now()) {
        throw new Error('Invalid or expired credential.')
      }
      store.delete(clientChallenge)
      return found.userHandle
    },
    generate(): string {
      const challenge = randomBytes(16).toBase64({
        alphabet: 'base64url',
        omitPadding: true,
      })
      store.set(challenge, {
        expires: Date.now() + WebAuthN.RP_TIMEOUT,
        userHandle: createUserHandle(),
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
 *  Registration challenge store which will hold challenges.
 */
const challenges = createRegistrationChallengeStore()

interface WebAuthNResponse {
  id: string
  userHandle: string
  clientDataJSON: string
  signature: string
}

interface RegistrationResponse {
  attestationObject: string
  authenticatorData: string
  clientDataJSON: string
  publicKey: string
  publicKeyAlgorithm: -7
  transports: ['hybrid', 'internal']
}

interface RegistrationCredential {
  authenticatorAttachment: string | 'platform'
  clientExtensionResults: {}
  id: string
  rawId: string
  response: RegistrationResponse
  type: 'public-key'
}

/**
 * Start the registration process by assigning a new challenge for a given
 * username.
 */
export const registerStart = (props: { user: User }): PublicKeyCredentialCreationOptionsJSON => {
  const challenge = challenges.generate()
  const userHandle = createUserHandle()

  console.log('[webauthn][register] started:', {
    challenge,
    userHandle,
  })

  return {
    challenge,
    rp: {
      name: 'Asleepace',
      id: WebAuthN.RP_ID,
    },
    user: {
      id: userHandle,
      name: props.user.email,
      displayName: props.user.username,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },
      { alg: -257, type: 'public-key' },
    ],
    excludeCredentials: [],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      requireResidentKey: false,
      userVerification: 'required',
    },
    attestation: 'none',
    timeout: 60000,
  }
}

/**
 * Call this method to finish the registration process.
 */
export function registerComplete({ user, credential }: { user: User; credential: RegistrationCredential }) {
  const { response } = credential
  const clientData = decodeBase64JSON<ClientDataJSON>(response.clientDataJSON)
  const authenticatorData = decodeAuthenticatorData(response)

  const userHandle = challenges.validate(clientData.challenge)

  if (!userHandle) {
    throw new Error('Authenticator missing user handle!')
  }

  if (clientData.origin !== WebAuthN.RP_ORIGIN) {
    throw new Error('Authenticator origin mismatch!')
  }

  if (clientData.type !== WebAuthN.CreateType) {
    throw new Error('Authenticator type mismatch!')
  }

  if (!authenticatorData.flags.userPresent) {
    throw new Error('Authenticator user not present!')
  }

  if (!authenticatorData.flags.userVerified) {
    throw new Error('Authenticator user not verified!')
  }

  Credentials.addCredential({
    credentialId: credential.id,
    userId: user.id,
    userHandle: userHandle,
    publicKey: response.publicKey,
  })

  return true
}
