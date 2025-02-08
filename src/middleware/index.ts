import { Analytics, Sessions } from '@/db'
import { getIpAddressFromHeaders } from '@/lib/utils/ipAddress'
import { defineMiddleware, sequence } from 'astro:middleware'

/**
 * Middleware
 *
 * Middleware is used to process requests and responses before they are sent to the client.
 *
 * documentation: https://docs.astro.build/en/guides/middleware/
 *
 * See the `env.d.ts` file for types.
 *
 * @note pages which are pre-rendered bypass middleware!
 *
 * @note see bottom of this file!
 *
 */

//
// --------------------- utilities ---------------------
//

/**
 * Auth Middleware
 *
 * This middleware will run on SSR pages only and will fetch a user from the session cookie,
 * if the user is found, the user data will be set to the locals object.
 *
 */
const authMiddleware = defineMiddleware(async (context, next) => {
  // NOTE: ignore pre-rendered pages!
  if (context.isPrerendered) return next()

  // validate user from session cookie
  const sessionCookie = context.cookies.get('session')
  const user = Sessions.getUser(sessionCookie?.value)

  console.log('[authMiddleware] sessionCookie:', sessionCookie)
  console.log('[authMiddleware] user:', user)

  // set user data to locals
  context.locals.isLoggedIn = Boolean(user)
  context.locals.user = user

  return await next()
})

/**
 * Analytics Middleware
 *
 * This middleware tracks request data and stores it in the database.
 *
 */
const analyticsMiddleware = defineMiddleware((context, next) => {
  if (context.isPrerendered) return next()

  const { request, cookies } = context
  const { headers } = request

  // ignore double logging analytics
  if (request.url.includes('/api/analytics')) return next()

  const referrer = headers.get('referer')
  const userAgent = headers.get('user-agent')
  const ipAddress = getIpAddressFromHeaders(headers)
  const sessionId = cookies.get('session')?.value

  Analytics.track({
    path: context.url.href,
    userAgent: userAgent ?? undefined,
    ipAddress: ipAddress ?? undefined,
    sessionId: sessionId ?? undefined,
    referrer: referrer ?? undefined,
  })

  return next()
})

/**
 * ## Middleware
 *
 * Process requests and responses before they are sent to the client,
 * all steps are included in the sequence below.
 *
 * documentation: https://docs.astro.build/en/guides/middleware/
 *
 *  1. Analytics based logging
 *  2. Authorization
 *  3. Remove redacted info?
 *
 */
export const onRequest = sequence(analyticsMiddleware, authMiddleware)
