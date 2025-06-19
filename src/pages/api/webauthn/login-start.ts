import { loginStart } from '@/lib/webauthn/register'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async (ctx) => {
  console.log(ctx.request)
  const body = await ctx.request.json()

  console.log('[WebAuthN] login body:', body)

  const { username } = body

  console.log('[WebAuthN] login start:', username)

  const challenge = loginStart({ username })

  return Response.json(challenge)
}
