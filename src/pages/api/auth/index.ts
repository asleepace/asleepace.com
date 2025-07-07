import type { APIRoute } from 'astro'
import { Users, Sessions } from '@/db/index.server'
import { siteConfig } from '@/consts'
import { Cookies } from '@/lib/backend/cookies'

export const prerender = false
export const route = '/api/auth'

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

    Cookies.setSessionCookie(cookies, session.token)

    locals.isLoggedIn = true
    locals.user = user

    return redirect(siteConfig.path.adminHome, 302)
  } catch (e) {
    console.error('[auth] error:', e)
    const error = (e as Error)?.message ?? 'unknown'
    return redirect(siteConfig.path.adminLogin({ error }), 302)
  }
}
