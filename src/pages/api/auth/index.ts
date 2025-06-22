import type { APIRoute } from 'astro'
import { Users, Sessions } from '@/db/index'
import { PATH, siteConfig } from '@/consts'

export const prerender = false
export const route = '/api/auth'

const environment = process.env.ENVIRONMENT
const isDevelopment = Boolean(environment === 'development')
const isProduction = !isDevelopment
const cookieDomain = isDevelopment ? 'localhost' : process.env.COOKIE_DOMAIN

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30

console.assert(cookieDomain, 'COOKIE_DOMAIN env variable is not set!')
console.assert(
  environment === 'development' || environment === 'production',
  'ENVIRONMENT env variable is not set to development or production!'
)

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
 * POST /api/auth
 *
 * This endpoint can be used to either login or register a user.
 */
export const POST: APIRoute = async ({ request, locals, cookies, redirect }) => {
  try {
    console.log('[api/auth] login:', request)

    // --- parse the request body ---

    const CONTENT_TYPE_MULTIPART = 'multipart/form-data'
    const CONTENT_TYPE_FORM = 'application/x-www-form-urlencoded'
    const CONTENT_TYPE_JSON = 'application/json'

    const contentType = request.headers.get('content-type') || request.headers.get('Content-Type')

    const isMultiPartEncoded = contentType?.includes(CONTENT_TYPE_MULTIPART)
    const isFormEncoded = contentType?.includes(CONTENT_TYPE_FORM)
    const isJsonEncoded = contentType?.includes(CONTENT_TYPE_JSON)

    let username: string | undefined
    let password: string | undefined

    if (isFormEncoded || isMultiPartEncoded) {
      const formData = await request.formData()
      username = formData.get('username')?.toString()
      password = formData.get('password')?.toString()
    } else if (isJsonEncoded) {
      const body = await request.json()
      username = body.username
      password = body.password
    } else {
      throw new Error('Invalid body content.')
    }

    if (!username) throw new Error('invalid_username')
    if (!password) throw new Error('invalid_password')

    // --- find the user ---

    const user = Users.findUser({ username, email: username })

    if (!user) throw new Error('user_not_found')

    // --- verify the password ---

    const isPasswordValid = await Users.verifyPassword(user.password, password)

    if (!isPasswordValid) throw new Error('invalid_password')

    // --- on success, create a session ---

    const session = Sessions.create(user.id)
    const sessionToken = session.token

    const cookieOptions = {
      /** where the cookie is valid (must match to delete) */
      path: siteConfig.cookiePath,
      /** the domain that the cookie is valid for */
      domain: cookieDomain,
      /** javascript cannot access the cookie */
      httpOnly: true,
      /** if the cookie is only accessible via https */
      secure: isProduction,
      /** if the cookie is only accessible via the same site */
      sameSite: 'lax',
      /** the expiration date of the cookie */
      expires: new Date(Date.now() + THIRTY_DAYS), // 30 days
    } as const

    cookies.set('session', sessionToken, cookieOptions) // set the cookie
    locals.isLoggedIn = true
    locals.user = user

    console.log('[auth] setting cookie:', cookieOptions)

    return redirect(PATH.ADMIN_HOME, 302)
  } catch (e) {
    console.error('[auth] error:', e)
    const error = (e as Error)?.message ?? 'unknown'
    return redirect(PATH.ADMIN_LOGIN({ error }), 302)
  }
}
