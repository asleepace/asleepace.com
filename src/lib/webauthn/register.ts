import { randomBytes } from 'node:crypto'

const challenges = new Map<string, string>()
const users = new Map<string, any>()

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
      rpId: 'localhost', // Change to your domain
      userVerification: 'required' as const,
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
export function registerStart({ username }: { username: string }) {
  const challenge = randomBytes(32).toBase64({ alphabet: 'base64url' })
  challenges.set(username, challenge)

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptionsJSON =
    {
      challenge,
      rp: {
        name: 'Asleepace',
        id: 'localhost', // Change to your domain
      },
      user: {
        id: randomBytes(16).toBase64({ alphabet: 'base64url' }),
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' as const }],
      authenticatorSelection: {
        authenticatorAttachment: 'platform' as const,
        userVerification: 'required' as const,
      },
      timeout: 60000,
    }

  return JSON.stringify(publicKeyCredentialCreationOptions)
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
  credential: PublicKeyCredential
}) {
  const challengeForUser = challenges.get(username)

  if (!challengeForUser) throw new Error('Missing challenge for user')

  const { response } = credential

  const clientDataBuffer = Buffer.from(response.clientDataJSON).toBase64({
    alphabet: 'base64url',
  })
  const clientDataJson = JSON.parse(clientDataBuffer)

  const hasChallenge =
    'challenge' in clientDataJson &&
    typeof clientDataJson.challenge === 'string'

  if (!hasChallenge) throw new Error('Missing challenge in client data')

  if (clientDataJson.challenge !== challengeForUser) {
    throw new Error('Challenge mismatch!')
  }

  console.log('[success] credential:', credential.id)

  users.set(username, {
    credentialId: credential.id,
    publicKey: credential.rawId,
    counter: credential.getClientExtensionResults(),
  })

  challenges.delete(username)

  return true
}
