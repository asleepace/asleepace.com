import type { APIRoute } from 'astro'

import { registerStart } from '@/lib/webauthn/register'

export const POST: APIRoute = async (ctx) => {
  const { username } = await ctx.request.json()

  const challenge = registerStart({
    username,
  })

  return new Response(JSON.stringify(challenge), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
