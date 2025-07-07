import { siteConfig } from '@/consts'
import { consoleTag } from '@/utils/tagTime'
import type { AstroCookies } from 'astro'

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30

const print = consoleTag('cookies')

/**
 *  ## Cookies
 *
 *  This namespace provides functions for managing cookies.
 *
 *  @note the cookie path and domain must match the path and domain that was set in the cookie.
 *
 *  @note the cookie expiration is set to 30 days.
 */
export namespace Cookies {
  export const SESSION_COOKIE_NAME = 'session'
  export const SESSION_COOKIE_EXPIRATION = THIRTY_DAYS

  export function getCookieOptions() {
    const cookieOptions = {
      /** where the cookie is valid (must match to delete) */
      path: siteConfig.cookiePath,
      /** the domain that the cookie is valid for */
      domain: siteConfig.cookieDomain,
      /** javascript cannot access the cookie */
      httpOnly: true,
      /** if the cookie is only accessible via https */
      secure: import.meta.env.PROD,
      /** if the cookie is only accessible via the same site */
      sameSite: 'lax',
      /** the expiration date of the cookie */
      expires: new Date(Date.now() + THIRTY_DAYS), // 30 days
    } as const

    return cookieOptions
  }

  export function setSessionCookie(cookies: AstroCookies, sessionToken: string) {
    const cookieOptions = getCookieOptions()
    cookies.set(SESSION_COOKIE_NAME, sessionToken, cookieOptions)
    print('set session cookie:', sessionToken)
  }

  export function deleteSessionCookie(cookies: AstroCookies) {
    const cookieOptions = getCookieOptions()
    cookies.delete(SESSION_COOKIE_NAME, cookieOptions)
    print('deleted session cookie')
  }

  export function getSessionCookie(cookies: AstroCookies): string | undefined {
    return cookies.get(SESSION_COOKIE_NAME)?.value
  }
}
