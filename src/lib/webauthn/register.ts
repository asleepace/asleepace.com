import type { User } from '@/db/types'
import { randomBytes } from 'node:crypto'
import { decodeAuthenticatorData, deocdeBase64JSON } from './utils'
import { Crendentials } from '@/db'

const registrationChallenges = new Map<number, string>()
const passkeyForChallenge = new Map<string, string>()

/**
 *  RP_ID: needs to be "localhost" in development and set to the domain in production,
 *  will not work in development if site is behind a proxy.
 */
const RP_ID = process.env.WEBAUTHN_RP_ID

/**
 * Start the registration process by assigning a new challenge for a given
 * username.
 */
export function registerStart({ user }: { user: User }): PublicKeyCredentialCreationOptionsJSON {
  const challenge = randomBytes(32).toBase64({
    alphabet: 'base64url',
    omitPadding: true,
  })

  registrationChallenges.set(user.id, challenge)

  const passkey = randomBytes(16).toBase64({
    alphabet: 'base64url',
    omitPadding: true,
  })

  // NOTE: this is what will be saved to the database
  passkeyForChallenge.set(challenge, passkey)

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptionsJSON = {
    challenge,
    rp: {
      name: 'Asleepace',
      id: RP_ID, // Change to your domain
    },
    user: {
      id: passkey,
      name: user.username,
      displayName: user.username,
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

  return publicKeyCredentialCreationOptions
}

/**
 * Call this method to finish the registration process.
 */
export function registerComplete({ user, credential }: { user: User; credential: PublicKeyCredentialJSON }) {
  const challengeForUser = registrationChallenges.get(user.id)
  console.log('[WebAuthN] - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +')
  console.log('[WebAuthN] registration complete:', user.email)

  if (!challengeForUser) throw new Error('Missing challenge for user')
  console.log('[WebAuthN] challengeForUser', challengeForUser)

  const passkey = passkeyForChallenge.get(challengeForUser)

  const { response } = credential
  const clientData = deocdeBase64JSON(response.clientDataJSON)
  const authenticatorData = decodeAuthenticatorData(response)
  const publicKey = response.publicKey
  console.log('[WebAuthN] registration public key:', publicKey)
  console.log('[WebAuthN] registration authenticator data:', authenticatorData)
  console.log('[WebAuthN] registration client data:', clientData)
  console.log('[WebAuthN] passkey:', passkey)

  const hasChallenge = Boolean('challenge' in clientData && typeof clientData.challenge === 'string')
  if (!hasChallenge) throw new Error('Missing challenge in client data')

  if (clientData.challenge !== challengeForUser) {
    throw new Error('Challenge mismatch!')
  }

  if (!passkey) throw new Error('Missing passkey for challenge!')

  console.log('[success] credential:', credential, passkey)

  Crendentials.addCredential({
    credentialId: response.id,
    userId: user.id,
    userHandle: passkey,
    publicKey,
  })

  registrationChallenges.delete(user.id)
  return true
}
