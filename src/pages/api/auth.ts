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
  const { headers } = await http.parse(request)

  const authorization = headers['Authorization'] || headers['authorization']

  const users = await Users.fetchUsers()

  console.log('[users]', users)

  if (!authorization) {
    return http.failure(401, 'Unauthorized')
  }

  return http.success({
    users,
  })
})

/**
 * POST /api/auth
 *
 * This endpoint can be used to either login or register a user.
 */
export const POST: APIRoute = endpoint(async ({ request }) => {
  const { headers } = await http.parse(request)

  const authorization = headers['Authorization'] || headers['authorization']

  const { email, username, password, type = 'login' } = await request.json()

  if (!email || !username) {
    return http.failure(400, 'Invalid email or username')
  }

  if (!password || password.length < 8) {
    return http.failure(400, 'Invalid password')
  }

  // TODO: if already authenticated, return the user

  try {
    const user = Users.createUser({
      email,
      username,
      password,
    })
    return http.success(user)
  } catch (error) {
    return http.failure(400, 'Bad Request')
  }
})
