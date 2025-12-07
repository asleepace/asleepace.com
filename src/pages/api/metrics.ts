/**
 * @file src/page/api/metrics.ts
 * @description API endpoint for page views, likes and statistics.
 */
import type { APIRoute } from 'astro'
import { incrementPageViews, incrementPageLikes, decrementPageLikes, getPageStats } from '@/lib/db/page-statistics'
import { z } from 'zod'

const PageLikePayload = z.object({
  isLiked: z.boolean(),
})

/**
 * GET /api/metrics
 *
 * Increment page views and return page statistics.
 */
export const GET: APIRoute = async ({ request }) => {
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')
  try {
    if (!referer) throw new Error(`[api] metrics missing referer "${host}"`)
    const path = new URL(referer).pathname

    if (import.meta.env.DEV) {
      const stats = await getPageStats({ path })
      if (stats) return Response.json(stats)
    }

    const stats = await incrementPageViews({ path })
    if (!stats) throw new Error(`[api] missing stats for path "${referer}"`)
    return Response.json(stats)
  } catch (e) {
    return Response.json({ error: `Missing stats for "${host}".` }, { status: 500 })
  }
}

/**
 * POST /api/metrics
 * JSON {
 *  isLiked: boolean
 * }
 *
 * Increment or decrement page likes for the specified page and return
 * page statistics.
 *
 */
export const POST: APIRoute = async ({ request }) => {
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')
  try {
    if (!referer) throw new Error(`[api] metrics missing referer "${host}"`)
    const path = new URL(referer).pathname
    const bodyJson = await request.json()
    const payload = PageLikePayload.parse(bodyJson)

    if (payload.isLiked) {
      const stats = await incrementPageLikes({ path })
      return Response.json(stats)
    } else {
      const stats = await decrementPageLikes({ path })
      return Response.json(stats)
    }
  } catch (e) {
    return Response.json({ error: `Missing stats for "${host}".` }, { status: 500 })
  }
}
