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
  const { headers } = await http.parse(request)

  const authorization = headers['Authorization'] || headers['authorization']

  if (!authorization) {
    return http.failure(401, 'Unauthorized')
  }

  const [authType, sessionToken] = authorization.split(' ')

  if (authType !== 'Bearer') {
    return http.failure(401, 'Invalid authorization type')
  }

  if (!sessionToken) {
    return http.failure(401, 'Unauthorized')
  }

  const user = Sessions.findUser(sessionToken)

  return http.success(user)
})
