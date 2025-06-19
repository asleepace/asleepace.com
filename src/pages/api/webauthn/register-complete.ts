import type { APIRoute } from 'astro'

import { registerComplete, registerStart } from '@/lib/webauthn/register'
import { password } from 'bun'

export const POST: APIRoute = async (ctx) => {
  const { username, credential } = await ctx.request.json()

  console.log('[WebAuthN] registration complete:', { username, credential })

  const success = registerComplete({
    username,
    credential,
  })

  return Response.json({ success })
}
