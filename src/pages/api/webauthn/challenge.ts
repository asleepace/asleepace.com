import { startSignInChallenge } from '@/lib/webauthn/signIn'
import type { APIRoute } from 'astro'

const ErrorResponse = (e: unknown) => {
  const error = e instanceof Error ? e.message : 'Failed to start sign in challenge'
  return Response.json({ error }, { status: 500 })
}

export const POST: APIRoute = async () => {
  try {
    console.log('[api][webauthn] starting sign-in challenge!')
    const challenge = startSignInChallenge()
    return Response.json(challenge)
  } catch (e) {
    console.warn('[api][webauthn] error starting challenge:', e)
    return ErrorResponse(e)
  }
}
