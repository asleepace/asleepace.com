/**
 * @file src/page/api/metrics.ts
 * @description API endpoint for page views, likes and statistics.
 */
import type { APIRoute } from 'astro'
import { incrementPageViews, incrementPageLikes, decrementPageLikes, getPageStats } from '@/lib/db/page-statistics'
import { z } from 'zod'

const MetricsPayload = z
  .object({
    action: z.enum(['liked', 'unliked', 'viewed']),
    href: z.string(),
  })
  .passthrough()

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
  try {
    const metrics = MetricsPayload.parse(await request.json())
    const path = new URL(metrics.href).pathname

    switch (metrics.action) {
      case 'liked':
        return Response.json(await incrementPageLikes({ path }))
      case 'unliked':
        return Response.json(await decrementPageLikes({ path }))
      default:
        return Response.json(await incrementPageViews({ path }))
    }
  } catch (e) {
    console.warn('[api/metrcis] err:', e)
    const error = e instanceof Error ? e : new Error(String(e))
    return Response.json({ error: error.message }, { status: 500 })
  }
}
