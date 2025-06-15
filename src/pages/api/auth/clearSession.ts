import { siteConfig } from '@/consts'
import type { APIRoute } from 'astro'

export const prerender = false

export const route = '/api/auth/clearSession'

/**
 *  ## POST /api/auth/clearSession
 *
 *  This endpoint is used to clear the session cookie.
 *
 *  @see https://lucia-auth.com/sessions/cookies/astro
 *
 *  @note when cleaing the cookie, the path must match the path that was set in the cookie.
 *
 */

export const POST: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('session', { path: '/' }) // IMPORTANT: must match path that was set!
  return redirect(siteConfig.path.adminLogin({}))
}
