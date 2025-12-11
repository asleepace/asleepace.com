import { fetchDailyReport } from '@/lib/server/fetch-daily-report'
import type { APIRoute } from 'astro'

/**
 * GET /api/sync
 *
 * Endpoint to manually fetch daily report.
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const limit = Number(url.searchParams.get('limit') ?? '300')
    const hardRefresh = url.searchParams.get('refresh') === 'hard'
    const dateParam = url.searchParams.get('date')
    const date = dateParam ? new Date(dateParam) : new Date()

    const response = await fetchDailyReport({
      date,
      refresh: true,
      hardRefresh,
      limit,
    })

    return Response.json(response)
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    return Response.json({ error: error.message }, { status: 500 })
  }
}
