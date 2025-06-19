import { loginStart } from '@/lib/webauthn/register'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async (ctx) => {
  const { username } = await ctx.request.json()

  const challenge = loginStart({ username })

  return Response.json(challenge)
}
