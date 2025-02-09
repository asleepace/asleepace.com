import { Analytics } from '@/db'
import { getIpAddressFromHeaders } from '@/lib/utils/ipAddress'
import { defineMiddleware } from 'astro:middleware'

/**
 *  ## analyticsMiddleware
 *
 *  This middleware tracks request data and stores it in the database.
 *
 */
export const analyticsMiddleware = defineMiddleware(
  ({ request, url, cookies, isPrerendered }, next) => {
    console.log('[middleware] analytics...')

    if (isPrerendered) return next()
    if (url.pathname.startsWith('/api/analytics')) return next()

    const { headers } = request
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

    return next()
  }
)
