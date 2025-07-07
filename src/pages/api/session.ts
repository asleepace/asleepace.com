import type { APIRoute } from 'astro'
import type { User } from '@/db/index.server'

export const prerender = false

export type SessionResponse = {
  user: User | undefined
  isLoggedIn: boolean
}

/**
 *  GET /api/session
 *
 *  This route returns the current user for the session or a 403,
 *  will remove sensitive data like password.
 *
 */
export const GET: APIRoute = async (ctx) => {
  const { user } = ctx.locals
  console.log('[api/session] user:', user)

  if (!user)
    return Response.json(
      {
        error: 'NOT_AUTHORIZED',
      },
      {
        status: 403,
        statusText: 'Not Authorized',
      }
    )

  // remove password from the response
  const { password, ...sanitizedUserData } = user

  // return the sanitized user data
  return Response.json(sanitizedUserData)
}
