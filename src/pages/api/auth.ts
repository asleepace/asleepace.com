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
  console.log('POST /api/auth', request)

  // --- don't leak information about the error ---
  const INVALID_LOGIN = 'Invalid username or password'

  // --- parse the request body ---
  const CONTENT_TYPE_FORM = 'application/x-www-form-urlencoded'
  const CONTENT_TYPE_JSON = 'application/json'

  const contentType =
    request.headers.get('content-type') || request.headers.get('Content-Type')
  const isFormEncoded = contentType?.includes(
    'application/x-www-form-urlencoded'
  )

  let username: string | undefined
  let password: string | undefined

  if (isFormEncoded) {
    const formData = await request.formData()
    username = formData.get('username')?.toString()
    password = formData.get('password')?.toString()
  } else {
    const body = await request.json()
    username = body.username
    password = body.password
  }

  if (!username) return http.failure(400, INVALID_LOGIN)
  if (!password) return http.failure(400, INVALID_LOGIN)

  // --- find the user ---

  const user = Users.findUser({ username, email: username })

  if (!user) return http.failure(401, INVALID_LOGIN)

  // --- verify the password ---

  const isPasswordValid = await Users.verifyPassword(user.password, password)

  if (!isPasswordValid) return http.failure(401, INVALID_LOGIN)

  // --- create a session ---

  const session = Sessions.create(user.id)

  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': `session=${session}; HttpOnly; Secure; SameSite=Strict`,
      Location: '/admin',
    },
  })
})
