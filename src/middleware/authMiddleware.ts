import { defineMiddleware } from 'astro:middleware'
import { Sessions } from '@/db/index'
import type { APIContext } from 'astro'

const WHITELIST = ['/api/analytics', '/api/auth']

const canSkipAuthorization = (context: APIContext) => {
  const url = new URL(context.request.url)
  const path = url.pathname

  // --- skip all pre-rendered or whitelisted pages ---

  const isPrerendered = context.isPrerendered

  const isWhitelisted =
    isPrerendered ||
    WHITELIST.some((whitelisted) => path.startsWith(whitelisted))

  const skipAuthorization = isWhitelisted || isPrerendered

  console.log('[authMiddleware] skipAuthorization:', path, skipAuthorization)

  return !skipAuthorization
}

/**
 *  ## authMiddleware
 *
 *  This middleware will run on SSR pages only and will fetch a user from the session cookie,
 *  if the user is found, the user data will be set to the locals object.
 *
 */
export const authMiddleware = defineMiddleware(async (context, next) => {
  try {
    if (canSkipAuthorization(context)) {
      throw new Error('ERR_AUTH_SKIP:' + context.request.url)
    }

    // --- validate user from session cookie ---

    const sessionCookie = context.cookies.get('session')?.value

    if (!sessionCookie) {
      throw new Error('ERR_AUTH_NO_COOKIE:' + context.request.url)
    }

    const user = await Sessions.getUser(sessionCookie)
    console.log('[authMiddleware] session:', user?.username)

    context.locals.isLoggedIn = true
    context.locals.user = user
  } catch (error) {
    console.warn('[authMiddleware] error:', error)

    context.locals.isLoggedIn = false
    context.locals.user = undefined
  } finally {
    return next()
  }
})
