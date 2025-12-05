import type { APIRoute } from 'astro'

import { registerStart } from '@/lib/server/webauthn/register'

export const POST: APIRoute = async (ctx) => {
  const { user } = ctx.locals

  if (!user) throw new Error('Must be logged in to register!')

  const challenge = registerStart({
    user,
  })

  return Response.json(challenge)
}
