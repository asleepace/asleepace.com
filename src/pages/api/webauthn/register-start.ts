import type { APIRoute } from 'astro'

import { registerStart } from '@/lib/webauthn/register'

export const POST: APIRoute = async (ctx) => {
  const { username } = await ctx.request.json()

  const challenge = registerStart({
    username,
  })

  return Response.json(challenge)
}
