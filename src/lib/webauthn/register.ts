import { randomBytes } from 'node:crypto'

const challenges = new Map<string, string>()
const users = new Map<string, any>()

const RP_ID = 'localhost'
const USER_VERIFICATION = 'required' as const

/**
 * Start the login process.
 */
export function loginStart({
  username,
}: {
  username: string
}): PublicKeyCredentialRequestOptionsJSON {
  const challenge = randomBytes(32).toString('base64url')
  challenges.set(username, challenge)

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptionsJSON =
    {
      challenge,
      timeout: 60000,
      rpId: RP_ID, // Change to your domain
      userVerification: USER_VERIFICATION,
      allowCredentials: [],
    }

  return publicKeyCredentialRequestOptions
}

export function loginComplete({
  username,
  credential,
}: {
  username: string
  credential: PublicKeyCredential
}) {
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
 * @param param0
 * @returns
 */
export function registerStart({
  username,
}: {
  username: string
}): PublicKeyCredentialCreationOptionsJSON {
  const challenge = randomBytes(32).toBase64({
    alphabet: 'base64url',
    omitPadding: true,
  })
  challenges.set(username, challenge)

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptionsJSON =
    {
      challenge,
      rp: {
        name: 'Asleepace',
        id: RP_ID, // Change to your domain
      },
      user: {
        id: randomBytes(16).toBase64({
          alphabet: 'base64url',
          omitPadding: true,
        }),
        name: username,
        displayName: username,
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

const deocdeBase64 = (base64: string): string => {
  return Buffer.from(base64, 'base64url').toString('utf-8')
}

const deocdeBase64JSON = (base64: string): any => {
  return JSON.parse(deocdeBase64(base64))
}

/**
 * Call this method to finish the registration process.
 * @param props
 */
export function registerComplete({
  username,
  credential,
}: {
  username: string
  credential: PublicKeyCredentialJSON
}) {
  const challengeForUser = challenges.get(username)

  console.log('[WebAuthN] registration complete:', username)

  if (!challengeForUser) throw new Error('Missing challenge for user')

  console.log('[WebAuthN] challengeForUser', challengeForUser)

  const { response } = credential

  const clientDataJSON = deocdeBase64JSON(response.clientDataJSON)
  // const attestionObject = deocdeBase64JSON(response.attestationObject)
  // const authenticatorData = deocdeBase64JSON(response.authenticatorData)
  const publicKey = response.publicKey

  const hasChallenge =
    'challenge' in clientDataJSON &&
    typeof clientDataJSON.challenge === 'string'

  if (!hasChallenge) throw new Error('Missing challenge in client data')

  if (clientDataJSON.challenge !== challengeForUser) {
    throw new Error('Challenge mismatch!')
  }

  console.log('[success] credential:', credential.id)

  users.set(username, {
    credentialId: credential.id,
    publicKey,
    counter: 0,
  })

  challenges.delete(username)

  return true
}
