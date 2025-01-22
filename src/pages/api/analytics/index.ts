import type { APIRoute } from 'astro'
import { endpoint } from '..'
import { Analytics } from '@/db'
import { http } from '@/lib/http'
import { getIpAddressFromHeaders } from '@/lib/utils/ipAddress'

/**
 * GET /api/analytics
 *
 * This endpoint is used to track analytics for the website.
 *
 */
export const GET: APIRoute = endpoint(async ({ request }) => {
  const { headers } = request

  const ipAddress = getIpAddressFromHeaders(headers)
  const userAgent = headers.get('user-agent')
  const sessionId = headers.get('session')
  const referrer = headers.get('referer')

  Analytics.track({
    path: request.url,
    ipAddress,
    userAgent,
    sessionId,
    referrer,
  })

  return http.success({ ipAddress })
})
