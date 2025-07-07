import { siteConfig } from '@/consts'
import { Cookies } from '@/lib/backend/cookies'
import type { APIRoute } from 'astro'

export const prerender = false

export const route = '/api/auth/clearSession'

/**
 *  ## POST /api/auth/clearSession
 *
 *  This endpoint is used to clear the session cookie
 *  @note when cleaing the cookie, the path must match the path that was set in the cookie.
 */

export const POST: APIRoute = async ({ cookies, redirect }) => {
  Cookies.deleteSessionCookie(cookies)
  return redirect(siteConfig.path.adminLogin({}))
}
