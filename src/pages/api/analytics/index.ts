import type { APIRoute } from 'astro'
import { endpoint } from '..'
import { Analytics } from '@/db'
import { http } from '@/lib/http'
import { getIpAddressFromHeaders } from '@/lib/utils/ipAddress'

export const prerender = false

/**
 * POST /api/analytics
 *
 * This endpoint is used to track analytics for the website.
 *
 */
export const POST: APIRoute = endpoint(async ({ request }) => {
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

/**
 * GET /api/analytics
 *
 * This endpoint is used to fetch analytics data from the database.
 *
 */
export const GET: APIRoute = endpoint(async ({ request, locals }) => {
  if (!locals.isLoggedIn) return http.failure(401, 'Unauthorized')

  const { searchParams } = await http.parse(request)

  const limit = parseInt(searchParams['limit']) ?? 100
  const offset = parseInt(searchParams['offset']) ?? 0

  const data = Analytics.fetchAnalytics(limit, offset)

  return http.success({ data, limit, offset })
})
