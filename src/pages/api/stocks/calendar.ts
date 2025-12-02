import type { APIRoute } from 'astro'
import { fetchYahooCalendar } from '@/lib/server/fetch-yahoo-calendar'

/**
 * GET /api/stocks/calendar
 */
export const GET: APIRoute = async ({ url }) => {
  const dateParam = url.searchParams.get('date')
  const date = dateParam ? new Date(dateParam) : undefined
  const page = await fetchYahooCalendar({ date })
  return Response.json(page)
}
