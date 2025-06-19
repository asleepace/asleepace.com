import { checkRandomChallenge, getRandomChallenge } from '@/lib/webauthn/register'
import type { APIRoute } from 'astro'

const parseBase64 = (base64: string) => {
  return Buffer.from(base64, 'base64url').toString('utf-8')
}

const parseBase64JSON = (base64: string) => {
  return JSON.parse(Buffer.from(base64, 'base64url').toString('utf-8'))
}

export const POST: APIRoute = async (ctx) => {
  console.log('[WebAuthN] challenge:', ctx.cookies)
  console.log('[WebAuthN] challenge:', ctx.request)
  console.log('[WebAuthN] challenge:', ctx.request.credentials)

  const { credential } = await ctx.request.json()
  console.log('[WebAuthN] credential:', credential)

  const result = checkRandomChallenge(credential)

  return Response.json({ result })
}
