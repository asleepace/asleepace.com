import type { APIRoute } from 'astro'

import { registerComplete } from '@/lib/server/webauthn/register'

export class MissingWebAuthNCredentials extends Error {
  name = 'MissingWebAuthNCredentials'
  message = 'Missing WebAuthN credential for registration.'
  constructor() {
    super()
  }
}

export class MissingWebAuthNUser extends Error {
  name = 'MissingWebAuthNUser'
  message = 'Must be signed in to complete WebAuthN registration.'
  constructor() {
    super()
  }
}

//  Register Complete - WebAuthN
//
//  Call this endpoint to complete the registration process,
//  must be logged in and have a valid credential.
//
export const POST: APIRoute = async (ctx) => {
  const { user } = ctx.locals
  const { credential } = await ctx.request.json()

  if (!user) throw new MissingWebAuthNUser()
  if (!credential) throw new MissingWebAuthNCredentials()

  console.log('[api][webauthn] registration complete!')

  const success = registerComplete({
    user,
    credential,
  })

  return Response.json({ success })
}
