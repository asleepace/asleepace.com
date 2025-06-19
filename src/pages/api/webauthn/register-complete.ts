import type { APIRoute } from 'astro'

import { registerComplete, registerStart } from '@/lib/webauthn/register'

export const POST: APIRoute = async (ctx) => {
  const { username, credential } = await ctx.request.json()

  const success = registerComplete({
    username,
    credential,
  })

  return new Response(JSON.stringify({ success }), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
