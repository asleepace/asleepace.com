import type { APIRoute } from 'astro'
import { incrementPageViews, incrementPageLikes, decrementPageLikes } from '@/lib/db/page-statistics'
import { z } from 'astro:content'

/**
 *  Returns the metrics for a given path as a JSON object.
 */
export const GET: APIRoute = async ({ url }) => {
  const isLiked = url.searchParams.get('liked')
  const path = url.pathname
  try {
    // handle on like:
    if (isLiked === '1' || isLiked === 'true') {
      const stats = await incrementPageLikes({ path })
      if (!stats) throw new Error(`Missing stats for path "${path}"`)
      return Response.json(stats)
    }

    // handle un-like:
    if (isLiked === '0' || isLiked === 'false') {
      const stats = await decrementPageLikes({ path })
      if (!stats) throw new Error(`Missing stats for path "${path}"`)
      return Response.json(stats)
    }

    // handle normal page view:
    const stats = await incrementPageViews({ path })
    if (!stats) throw new Error(`Missing stats for path "${path}"`)
    return Response.json(stats)
  } catch (e) {
    return Response.json({ error: `Missing stats for "${path}".` }, { status: 500 })
  }
}

const PageLikePayload = z.object({
  isLiked: z.boolean(),
})

/**
 *  Returns the metrics for a given path as a JSON object.
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
