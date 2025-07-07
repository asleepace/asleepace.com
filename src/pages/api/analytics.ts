import type { APIRoute } from 'astro'
import { endpoint } from '@/pages/api'
import { Analytics } from '@/db'
import { http } from '@/lib/web'
import { getIpAddressFromHeaders } from '@/lib/backend/ipAddress'

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

  Analytics.trackEvent({
    request,
    message: 'analytics',
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
  const daysParam = searchParams['days'] ? parseInt(searchParams['days']) : 30
  const days = isNaN(daysParam) ? 30 : daysParam
  const analytics = Analytics.getAnalytics({ days })
  return http.success(analytics)
})
