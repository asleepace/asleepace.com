/**
 * Helper class for handling WebAuthn authorization.
 */
export class WebAuthnClient {
  async register(username: string): Promise<boolean> {
    try {
      // Start registration
      const startResponse = await fetch('/api/webauthn/register-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })

      const options = await startResponse.json()

      // Convert challenge to Uint8Array
      options.challenge = this.base64urlToBuffer(options.challenge)
      options.user.id = this.base64urlToBuffer(options.user.id)

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
          credential: this.credentialToJSON(credential),
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

      const options = await startResponse.json()
      options.challenge = this.base64urlToBuffer(options.challenge)

      // Get credential
      const credential = (await navigator.credentials.get({
        publicKey: options,
      })) as PublicKeyCredential

      if (!credential) throw new Error('Failed to get credential')

      // Complete login
      const completeResponse = await fetch('/api/webauthn/login-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          credential: this.credentialToJSON(credential),
        }),
      })

      return completeResponse.ok
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  private base64urlToBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(base64)
    const buffer = new ArrayBuffer(binary.length)
    const view = new Uint8Array(buffer)
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i)
    }
    return buffer
  }

  private bufferToBase64url(buffer: ArrayBuffer): string {
    const binary = String.fromCharCode(...new Uint8Array(buffer))
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  private credentialToJSON(credential: PublicKeyCredential) {
    const response = credential.response as
      | AuthenticatorAttestationResponse
      | AuthenticatorAssertionResponse

    return {
      id: credential.id,
      type: credential.type,
      response: {
        clientDataJSON: this.bufferToBase64url(response.clientDataJSON),
        authenticatorData: this.bufferToBase64url(
          (response as any).authenticatorData
        ),
        signature: this.bufferToBase64url(
          (response as AuthenticatorAssertionResponse).signature ||
            new ArrayBuffer(0)
        ),
        publicKey: (response as AuthenticatorAttestationResponse).getPublicKey
          ? this.bufferToBase64url(
              (response as AuthenticatorAttestationResponse).getPublicKey()!
            )
          : undefined,
      },
    }
  }
}
