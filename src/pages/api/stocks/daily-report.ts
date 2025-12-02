import type { APIRoute } from 'astro'
import { fetchDailyReport } from '@/lib/server/fetch-daily-report'

/**
 * GET /api/stocks/daily-report
 *
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const DEFAULT_LIMIT = 300
    const limit = Number(url.searchParams.get('limit') ?? DEFAULT_LIMIT)
    const refreshStr = url.searchParams.get('refresh')
    const refresh = refreshStr === 'true' || Number(refreshStr) > 0
    const report = await fetchDailyReport({ limit, refresh })

    console.log('[GET] Report:', !!report)

    return Response.json(report)
  } catch (error) {
    const e = error instanceof Error ? error : new Error(String(error))
    console.error('[api/stocks/dail-report] error:', error)
    return Response.json({ error: e.message })
  }
}
