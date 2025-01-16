import type { APIRoute } from 'astro'
import { endpoint } from '.'
import { http } from '@/lib/http'
import { Users, Sessions } from '@/db/index'

export const prerender = false

/**
 * GET /api/auth
 *
 * Check if the user is authenticated and return the user if so.
 */
export const GET: APIRoute = endpoint(async ({ request }) => {
  const { oauthToken } = await http.parse(request)

  if (!oauthToken) {
    return http.failure(401, 'Unauthorized')
  }

  const user = Sessions.findUser(oauthToken)

  return http.success(user)
})

/**
 * POST /api/auth
 *
 * This endpoint can be used to either login or register a user.
 */
export const POST: APIRoute = endpoint(async ({ request }) => {
  const { email, username, password } = await request.json()

  if (!email || !username) {
    return http.failure(400, 'Invalid email or username')
  }

  if (!password || password.length < 8) {
    return http.failure(400, 'Invalid password')
  }

  const user = await Users.createUser({
    email,
    username,
    password,
  })

  const session = Sessions.create(user.id)

  return new Response(JSON.stringify(user), {
    headers: {
      'Set-Cookie': `session=${session}; HttpOnly; Secure; SameSite=Strict`,
      'Content-Type': 'application/json',
    },
  })
})
