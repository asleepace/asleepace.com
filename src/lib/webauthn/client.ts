import type { User } from '@/db/types'

const WebAuthnApi = {
  signInChallenge: '/api/webauthn/challenge',
  singInComplete: '/api/webauthn/complete',
  registerChallenge: '/api/webauthn/register-start',
  registerComplete: '/api/webauthn/register-complete',
} as const

const fetchWebAuthN = async <T = any>(props: { route: string; body?: string }) => {
  const response = await fetch(props.route, {
    credentials: 'same-origin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: props.body,
  })
  const json = await response.json()
  return json as T
}

const fetchThenRedirect = async (body: string) => {
  const response = await fetch(WebAuthnApi.singInComplete, {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-cache',
    redirect: 'follow',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    body,
  })

  if (response.redirected) {
    window.location.href = response.url
  }

  console.log('[WebAuthN] client:', response)
  return response.ok
}

/**
 *  ## WebAuthN Client
 *
 *  Provides two helper methods for registering and signing in with WebAuthN,
 *  will throw on errors. Both follow a 2-step process of:
 *
 *    - Generate a challenge (backend)
 *    - Authenticate the challenge (client)
 *    - Authorize result on backend (backend)
 *
 *  See the `/api/webauthn` routes for implementations.
 *
 */
export const webAuthnClient = {
  async signIn(options: { mediation: CredentialRequestOptions['mediation'] }) {
    const requestOptionsJSON = await fetchWebAuthN({ route: WebAuthnApi.signInChallenge })
    const challenge = PublicKeyCredential.parseRequestOptionsFromJSON(requestOptionsJSON)
    const credential = await navigator.credentials.get({
      mediation: options.mediation ?? 'conditional',
      publicKey: challenge,
    })
    return fetchThenRedirect(JSON.stringify({ credential }))
  },
  async register() {
    const createOptionsJSON = await fetchWebAuthN({ route: WebAuthnApi.registerChallenge })
    const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(createOptionsJSON)
    const credential = await navigator.credentials.create({
      publicKey,
    })
    if (!credential) throw new Error('Invalid credential!')
    return fetchWebAuthN({
      route: WebAuthnApi.registerComplete,
      body: JSON.stringify({ credential }),
    })
  },
}
