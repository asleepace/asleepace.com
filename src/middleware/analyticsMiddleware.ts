import { Analytics } from '@/db'
import { getIpAddressFromHeaders } from '@/lib/utils/ipAddress'
import { defineMiddleware } from 'astro:middleware'
import chalk from 'chalk'

const TAG = chalk.gray('[m] analytics\t')

/**
 *  ## analyticsMiddleware
 *
 *  This middleware tracks request data and stores it in the database.
 *
 */
export const analyticsMiddleware = defineMiddleware(
  ({ request, url, cookies, isPrerendered }, next) => {
    if (isPrerendered) return next()
    if (url.pathname.startsWith('/api/analytics')) return next()
    if (request.method === 'POST') return next()

    console.log(TAG, chalk.gray(url.pathname))

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
