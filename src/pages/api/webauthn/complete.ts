import { siteConfig } from '@/consts'
import { Sessions } from '@/db/index.server'
import { completeSignInChallenge } from '@/lib/webauthn/signIn'
import type { APIRoute } from 'astro'

export const prerender = false

const cookieDomain = import.meta.env.DEV ? 'localhost' : process.env.COOKIE_DOMAIN

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30

export const POST: APIRoute = async ({ request, cookies, locals, redirect }) => {
  try {
    console.log('[api][webauthn] completing sign-in...')

    const { credential } = await request.json()

    const user = await completeSignInChallenge(credential)

    if (!user || !user.id) throw new Error('Failed to load user for challenge')

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
      secure: import.meta.env.PROD,
      /** if the cookie is only accessible via the same site */
      sameSite: 'lax',
      /** the expiration date of the cookie */
      expires: new Date(Date.now() + THIRTY_DAYS), // 30 days
    } as const

    cookies.set('session', sessionToken, cookieOptions) // set the cookie
    locals.isLoggedIn = true
    locals.user = user

    console.log('[auth][webauthn] success, setting cookie:', cookieOptions)
    return redirect('/admin/', 302)
  } catch (e) {
    console.warn('[api][webauthn] error completing sign-in:', e)
    return Response.json(e, { status: 500 })
  }
}
