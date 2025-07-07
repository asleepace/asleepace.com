import { Analytics } from '@/db/index.server'
import { getIpAddressFromHeaders } from '@/lib/utils/ipAddress'
import { defineMiddleware } from 'astro:middleware'

const IGNORED_PATHS = [
  '/api/analytics',
  '/_actions/',
  '/fonts/',
  '/images/',
  '/scripts/',
  '/styles/',
  '/favicon.ico',
  '/sitemap.xml',
  '/robots.txt',
]

/**
 *  ## Analytics Middleware
 *
 *  This middleware tracks request data and stores it in the database, mainly we just want to track
 *  requests to the site, not the API.
 *
 *  @note this middleware is only run on GET requests.
 *
 */
export const analyticsMiddleware = defineMiddleware(({ request, url, cookies, isPrerendered }, next) => {
  if (isPrerendered) return next()
  if (request.method !== 'GET') return next()
  if (IGNORED_PATHS.some((path) => url.pathname.startsWith(path))) return next()

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
})
