/**
 * @file src/page/api/metrics.ts
 * @description API endpoint for page views, likes and statistics.
 */
import type { APIRoute } from 'astro'
import { incrementPageViews, incrementPageLikes, decrementPageLikes } from '@/lib/db/page-statistics'
import { z } from 'zod'

const PageLikePayload = z.object({
  isLiked: z.boolean(),
})

/**
 * GET /api/metrics
 *
 * Increment page views and return page statistics.
 */
export const GET: APIRoute = async ({ url }) => {
  const path = url.pathname
  try {
    const stats = await incrementPageViews({ path })
    if (!stats) throw new Error(`Missing stats for path "${path}"`)
    return Response.json(stats)
  } catch (e) {
    return Response.json({ error: `Missing stats for "${path}".` }, { status: 500 })
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
export const POST: APIRoute = async ({ url, request }) => {
  const path = url.pathname
  try {
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
    return Response.json({ error: `Missing stats for "${path}".` }, { status: 500 })
  }
}
