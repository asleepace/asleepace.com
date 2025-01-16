import type { APIRoute } from 'astro'
import { endpoint } from '.'
import { http } from '@/lib/http'
import { Users, Sessions } from '@/db/index'

export const prerender = false

/**
 * GET /api/session
 *
 * This route returns the current user for the session.
 */
export const GET: APIRoute = endpoint(async ({ request }) => {
  const { oauthToken, authType } = await http.parse(request)

  if (!oauthToken || !authType) {
    return http.failure(401, 'Unauthorized')
  }

  const user = Sessions.findUser(oauthToken)

  return http.success(user)
})
