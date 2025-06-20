import type { User } from '@/db/types'
import { randomBytes } from 'node:crypto'
import { passkeys } from '@/db'

const registrationChallenges = new Map<number, string>()
const passkeyForChallenge = new Map<string, string>()

const challenges = new Map<string, string>()
const users = new Map<string, any>()

const unpaired = new Set<string>()

const RP_ID = 'localhost'
const USER_VERIFICATION = 'required' as const

const deocdeBase64 = (base64: string): string => {
  return Buffer.from(base64, 'base64url').toString('utf-8')
}

const deocdeBase64JSON = (base64: string): any => {
  return JSON.parse(deocdeBase64(base64))
}

/**
 * Decodes the Authenticator Data present in the Public Key Credential
 * https://developer.mozilla.org/en-US/docs/Web/API/AuthenticatorAssertionResponse/authenticatorData
 * https://www.w3.org/TR/webauthn-2/#typedefdef-cosealgorithmidentifier
 * @param {AuthenticatorAssertionResponse} credential - JSON form.
 * @returns
 */
const decodeAuthenticatorData = (response: PublicKeyCredentialJSON) => {
  const buffer = Buffer.from(response.authenticatorData, 'base64url')
  let offset = 0

  // rpIdHash (32 bytes) - SHA256 hash of the RP ID
  const rpIdHash = buffer.subarray(offset, offset + 32)
  offset += 32

  // flags (1 byte)
  const flagsByte = buffer[offset]
  offset += 1

  // Parse flags
  const flags = {
    userPresent: !!(flagsByte & 0x01), // UP - User Present
    userVerified: !!(flagsByte & 0x04), // UV - User Verified
    attestedCredentialDataIncluded: !!(flagsByte & 0x40), // AT - Attested credential data included
    extensionDataIncluded: !!(flagsByte & 0x80), // ED - Extension data included
  } as const

  // signCount (4 bytes, big-endian)
  const signCount = buffer.readUInt32BE(offset)
  offset += 4

  console.log('[AuthenticatorData] rpIdHash:', rpIdHash.toString('hex'))
  console.log('[AuthenticatorData] flags:', flags)
  console.log('[AuthenticatorData] signCount:', signCount)

  return {
    rpIdHash,
    flags,
    signCount,
    buffer, // Keep original buffer for signature verification
  } as const
}

export function getRandomChallenge(): PublicKeyCredentialRequestOptionsJSON {
  const challenge = randomBytes(16).toBase64({
    alphabet: 'base64url',
    omitPadding: true,
  })

  console.log('[register] created challenge:', challenge)
  unpaired.add(challenge)

  return {
    challenge,
    timeout: 60_000,
    rpId: RP_ID,
    userVerification: USER_VERIFICATION,
    allowCredentials: [],
  }
}

export function checkRandomChallenge({ response }: PublicKeyCredentialJSON) {
  console.log('[WebAuthN] checkRandomChallenge:', response)
  const clientData = JSON.parse(Buffer.from(response.clientDataJSON, 'base64url').toString('utf-8'))
  // decode authenticator data
  const authenticatorData = decodeAuthenticatorData(response)

  console.log('[WebAuthN] authenticatorData:', authenticatorData)

  const { userHandle } = response // TODO: match this to one set during registration.
  console.log('[WebAuthN] userHandle:', userHandle)

  const isSignedIn = unpaired.has(clientData.challenge)

  if (!isSignedIn) throw new Error('User must be signed in with authenticator!')

  const user = passkeys.getUserByPasskey({ passkey: userHandle })

  console.log('[WebAuthN] clientData:', { clientData, isSignedIn, user })
  return user
}

/**
 * Start the login process.
 */
export function loginStart({ username }: { username: string }): PublicKeyCredentialRequestOptionsJSON {
  const challenge = randomBytes(32).toString('base64url')
  challenges.set(username, challenge)

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptionsJSON = {
    challenge,
    timeout: 60000,
    rpId: RP_ID, // Change to your domain
    userVerification: USER_VERIFICATION,
    allowCredentials: [],
  }

  return publicKeyCredentialRequestOptions
}

export function loginComplete({ username, credential }: { username: string; credential: PublicKeyCredential }) {
  const expectedChallenge = challenges.get(username)
  const user = users.get(username)

  if (!expectedChallenge || !user) {
    throw new Error('Login invalid request')
  }

  const { response } = credential

  const clientDataBuffer = Buffer.from(response.clientDataJSON).toBase64({
    alphabet: 'base64url',
  })
  const clientDataJSON = JSON.parse(clientDataBuffer)

  if (clientDataJSON.challenge !== expectedChallenge) {
    throw new Error('Login challenge mismatch!')
  }

  challenges.delete(username)

  return user
}

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
      userVerification: USER_VERIFICATION,
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
  const clientDataJSON = deocdeBase64JSON(response.clientDataJSON)
  // const attestionObject = deocdeBase64JSON(response.attestationObject)
  const authenticatorData = decodeAuthenticatorData(response)
  const publicKey = response.publicKey
  console.log('[WebAuthN] registration public key:', publicKey)
  console.log('[WebAuthN] registration authenticator data:', authenticatorData)
  console.log('[WebAuthN] registration client data:', clientDataJSON)
  console.log('[WebAuthN] passkey:', passkey)

  const hasChallenge = 'challenge' in clientDataJSON && typeof clientDataJSON.challenge === 'string'

  if (!hasChallenge) throw new Error('Missing challenge in client data')
  if (clientDataJSON.challenge !== challengeForUser) {
    throw new Error('Challenge mismatch!')
  }

  if (!passkey) throw new Error('Missing passkey for challenge!')

  console.log('[success] credential:', credential, passkey)
  passkeys.addPasskey({ userId: user.id, passkey })
  registrationChallenges.delete(user.id)
  return true
}
