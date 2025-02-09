import { Analytics } from '@/db'
import { getIpAddressFromHeaders } from '@/lib/utils/ipAddress'
import { defineMiddleware } from 'astro:middleware'

/**
 * Analytics Middleware
 *
 * This middleware tracks request data and stores it in the database.
 *
 */
export const analyticsMiddleware = defineMiddleware(
  ({ request, url, cookies, isPrerendered }, next) => {
    try {
      if (isPrerendered) throw new Error('ERR_ANALYTICS_SKIP:' + request.url)

      const { headers } = request

      // ignore double logging analytics
      if (url.pathname.includes('/api/analytics'))
        throw new Error('ERR_ANALYTICS_API:' + request.url)

      const referrer = headers.get('referer')
      const userAgent = headers.get('user-agent')
      const ipAddress = getIpAddressFromHeaders(headers)
      const sessionId = cookies.get('session')?.value

      Analytics.track({
        path: url.pathname,
        userAgent: userAgent ?? undefined,
        ipAddress: ipAddress ?? undefined,
        sessionId: sessionId ?? undefined,
        referrer: referrer ?? undefined,
      })
    } catch (error) {
      console.log(
        '[analyticsMiddleware] skipping:',
        url.pathname,
        error?.message
      )
    } finally {
      return next()
    }
  }
)
