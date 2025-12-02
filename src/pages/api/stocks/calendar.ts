import type { APIRoute } from 'astro'
import { fetchCalendar } from '@/lib/server/fetch-calendar'

/**
 * GET /api/stocks/calendar
 */
export const GET: APIRoute = async () => {
  const calendar = await fetchCalendar()
  console.log({ calendar })
  return Response.json(calendar)
}
