import type { APIRoute } from 'astro'
import { endpoint } from '.'
import { http } from '@/lib/http'
import { Users, Sessions } from '@/db/index'
import { WebResponse } from '@/lib/web/WebResponse'

export const prerender = false

const isDevelopment = Boolean(process.env.ENVIRONMENT === 'development')
const isProduction = !isDevelopment
const cookieDomain = isDevelopment ? undefined : process.env.COOKIE_DOMAIN

console.log(
  '[auth] config:',
  JSON.stringify(
    {
      isDevelopment,
      isProduction,
      cookieDomain,
    },
    null,
    2
  )
)

/**
 * GET /api/auth
 *
 * Check if the user is authenticated and return the user if so.
 */
export const GET: APIRoute = endpoint(async ({ request }) => {
  const { oauthToken } = await http.parse(request)
  if (!oauthToken) return http.failure(401, 'Unauthorized')
  const user = Sessions.findUser(oauthToken)
  return http.success(user)
})

/**
 * POST /api/auth
 *
 * This endpoint can be used to either login or register a user.
 */
export const POST: APIRoute = endpoint(async ({ request, cookies }) => {
  console.log('POST /api/auth', request)

  // --- don't leak information about the error ---

  const INVALID_LOGIN = 'Invalid username or password'

  // --- parse the request body ---

  const CONTENT_TYPE_FORM = 'application/x-www-form-urlencoded'
  const CONTENT_TYPE_JSON = 'application/json'

  const contentType =
    request.headers.get('content-type') || request.headers.get('Content-Type')

  const isFormEncoded = contentType?.includes(CONTENT_TYPE_FORM)
  const isJsonEncoded = contentType?.includes(CONTENT_TYPE_JSON)

  let username: string | undefined
  let password: string | undefined

  if (isFormEncoded) {
    const formData = await request.formData()
    username = formData.get('username')?.toString()
    password = formData.get('password')?.toString()
  } else if (isJsonEncoded) {
    const body = await request.json()
    username = body.username
    password = body.password
  } else {
    return WebResponse.redirect('/login?error=bad_content', 302)
  }

  if (!username) return http.failure(400, INVALID_LOGIN)
  if (!password) return http.failure(400, INVALID_LOGIN)

  // --- find the user ---

  const user = Users.findUser({ username, email: username })
  console.log('[auth] user:', user)

  if (!user) {
    console.log('[auth] user not found: ', username)
    return WebResponse.redirect('/login?error=invalid_credentials', 302)
  }

  // --- verify the password ---

  const isPasswordValid = await Users.verifyPassword(user.password, password)
  console.log('[auth] user:', user)

  if (!isPasswordValid) {
    console.log('[auth] invalid password')
    return WebResponse.redirect('/login?error=invalid_credentials', 302)
  }

  // --- create a session ---

  const session = Sessions.create(user.id)
  const sessionToken = session.token

  // --- set the session cookie ---

  cookies.set('session', sessionToken, {
    /** where the cookie is valid */
    path: '/',
    /** the domain that the cookie is valid for */
    domain: cookieDomain,
    /** javascript cannot access the cookie */
    httpOnly: true,
    /** if the cookie is only accessible via https */
    secure: isProduction,
    /** if the cookie is only accessible via the same site */
    sameSite: 'lax',
    /** the expiration date of the cookie */
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
  })

  // --- redirect to the admin page ---

  return WebResponse.redirect('/admin', 302)
})
