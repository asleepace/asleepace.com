import type { APIRoute } from 'astro'
import { fetchDailyReport } from '@/lib/server/fetch-daily-report'

const DEFAULT_LIMIT = 300

/**
 * GET /api/stocks/daily-report
 *
 * This is an API endpoint to return the report as JSON, generally this is mainly
 * used for debugging.
 *
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const limit = Number(url.searchParams.get('limit') ?? DEFAULT_LIMIT)
    const refreshStr = url.searchParams.get('refresh')
    const refresh = refreshStr === 'true' || Number(refreshStr) > 0
    const report = await fetchDailyReport({ limit, refresh })
    return Response.json(report)
  } catch (error) {
    const e = error instanceof Error ? error : new Error(String(error))
    console.error('[api/stocks/daily-report] error:', error)
    return Response.json({ error: e.message })
  }
}
