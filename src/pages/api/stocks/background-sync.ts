import type { APIRoute } from 'astro'
import { triggerDailyReportRefreshInBackground } from '@/lib/server/fetch-daily-report'

/**
 * GET /api/stocks/background-sync
 *
 * This endpoint is called automatically every 15 mins from a chron job
 * running in pm2 and should be used to schedule background tasks.
 */
export const GET: APIRoute = async () => {
  const now = new Date()
  try {
    // refresh daily report for today
    void triggerDailyReportRefreshInBackground({ date: now })
    return Response.json({ ok: true })
  } catch (e) {
    console.warn('[background-sync] error:', e)
    return Response.json({ ok: false })
  } finally {
    console.log('[background-sync] finished:', now.toLocaleTimeString('en-US', { timeStyle: 'full' }))
  }
}
