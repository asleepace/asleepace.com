/**
 * Helper class for handling WebAuthn authorization.
 */
export class WebAuthnClient {
  static fetch(url: string, body?: any) {
    return fetch(url, {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
      .then((res) => res.json())
      .catch((err) => console.warn(err))
  }

  async signIn(): Promise<void> {
    const json = await WebAuthnClient.fetch('/api/webauthn/challenge')
    console.log("[client] signIn", { json })

    const challenge = PublicKeyCredential.parseRequestOptionsFromJSON(json)
    console.log("[client] signIn", { challenge })

    const credential = await navigator.credentials.get({
      mediation: 'conditional',
      publicKey: challenge,
    })

    console.log("[client] signIn", { credential })

    const isLoggedIn = await WebAuthnClient.fetch('/api/webauthn/complete', {
      credential
    })
  }

  async register(username: string): Promise<boolean> {
    try {
      console.log('[WebAuthnClient] registering:', username)
      const startResponse = await fetch('/api/webauthn/register-start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      const json =
        (await startResponse.json()) as PublicKeyCredentialCreationOptionsJSON
      console.log('[WebAuthnClient] register response:', json)

      const options = PublicKeyCredential.parseCreationOptionsFromJSON(json)
      console.log('[WebAuthnClient] register response:', { json })
      console.log('[WebAuthnClient] options:', { options })

      // Create credential
      const credential = (await navigator.credentials.create({
        publicKey: options,
      })) as PublicKeyCredential

      if (!credential) throw new Error('Failed to create credential')

      // Complete registration
      const completeResponse = await fetch('/api/webauthn/register-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          credential,
        }),
      })

      return completeResponse.ok
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  }

  async login(username: string): Promise<boolean> {
    try {
      // Start login
      const startResponse = await fetch('/api/webauthn/login-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })

      const json =
        (await startResponse.json()) as PublicKeyCredentialRequestOptionsJSON
      const options = PublicKeyCredential.parseRequestOptionsFromJSON(json)

      const abort = new AbortController()

      // Get credential
      const credential = await navigator.credentials.get({
        signal: abort.signal,
        mediation: 'conditional',
        publicKey: options,
      })

      if (!credential) throw new Error('Failed to get credential')

      console.log('[WebAuthN] credential:', credential)

      // Complete login
      const completeResponse = await fetch('/api/webauthn/login-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          credential: credential,
        }),
      })

      console.log({ completeResponse })

      return completeResponse.ok
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }
}
