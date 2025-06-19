import { getRandomChallenge } from '@/lib/webauthn/register'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async (ctx) => {
  console.log('[WebAuthN] challenge:', ctx.cookies)
  console.log('[WebAuthN] challenge:', ctx.request)
  console.log('[WebAuthN] challenge:', ctx.request.credentials)
  return Response.json(getRandomChallenge())
}
