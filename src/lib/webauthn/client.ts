/**
 * Helper class for handling WebAuthn authorization.
 */
export class WebAuthnClient {
  async register(username: string): Promise<boolean> {
    try {
      console.log('[WebAuthnClient] registering:', username)

      // Start registration
      const startResponse = await fetch('/api/webauthn/register-start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      const json = await startResponse.json() as PublicKeyCredentialCreationOptionsJSON
      console.log('[WebAuthnClient] register response:', json)

      const options = PublicKeyCredential.parseCreationOptionsFromJSON(json)
      console.log('[WebAuthnClient] register response:', { json })
      console.log('[WebAuthnClient] options:', { options })

      // Convert challenge to Uint8Array
      // let options: PublicKeyCredentialCreationOptions = {
      //   ...json,
      //   challenge: this.base64urlToBuffer(json.challenge),
      //   user: {
      //     ...json.user,
      //     id: this.base64urlToBuffer(json.user.id),
      //   },
      //   attestation: 'direct',
      // }
      // options.challenge = this.base64urlToBuffer(json.challenge)
      // options.user.id = this.base64urlToBuffer(json.user.id)

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

      const abortSignle = new AbortController()

      // Get credential
      const credential = (await navigator.credentials.get({
        signal: abortSignle.signal,
        mediation: 'conditional',
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

  base64urlToBuffer(base64url: string): ArrayBuffer {
    try {
      console.log({ base64url })
      // Convert base64url to base64
      let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')

      // Add proper padding
      while (base64.length % 4) {
        base64 += '='
      }

      // Decode to binary string
      const binaryString = window.atob(base64)

      // Convert to ArrayBuffer
      const buffer = new ArrayBuffer(binaryString.length)
      const view = new Uint8Array(buffer)

      for (let i = 0; i < binaryString.length; i++) {
        view[i] = binaryString.charCodeAt(i)
      }

      return buffer
    } catch (error) {
      console.error('Failed to decode base64url:', base64url, error)
      throw new Error('Invalid base64url string')
    }
  }

  private bufferToBase64url(buffer: ArrayBuffer): string {
    return new Uint8Array(buffer).toBase64({ alphabet: 'base64url' })
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
