import type { APIRoute } from 'astro'
import { WebResponse } from '@/lib/web'
import type { User } from '@/db/types'

export const prerender = false

export type SessionResponse = {
  user: User | undefined
  isLoggedIn: boolean
}

/**
 *  GET /api/session
 *
 *  This route returns the current user for the session and a flag indicating
 *  whether the user is logged in.
 *
 *  @response {{ user: User, isLoggedIn: boolean }}
 *
 *  @note always returns a 200
 *
 */
export const GET: APIRoute = async ({
  locals: { user = undefined, isLoggedIn = false },
}) => {
  return WebResponse.OK({ user, isLoggedIn })
}
