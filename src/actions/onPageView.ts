import { defineAction } from 'astro:actions'
import { z } from 'astro:content'
import { Metrics } from '@/db/'

/**
 *  Register a page like.
 */
export const onPageLike = defineAction({
  input: z.object({
    referer: z.string().optional(),
    unliked: z.boolean().default(false),
  }),
  async handler(input, context) {
    const referer = input.referer ?? context.request.headers.get('referer')
    if (!referer) throw new Error('Missing referer!')
    const route = new URL(referer).pathname
    if (!route) throw new Error('Missing route or referer!')
    if (input.unliked) {
      Metrics.decrementPageLikes(route)
    } else {
      Metrics.incrementPageLikes(route)
    }
    return Metrics.getPageMetrics(route)
  },
})

/**
 *  Register a page view.
 */
export const onPageView = defineAction({
  input: z.object({
    referer: z.string().optional(),
  }),
  async handler(input, context) {
    const referer = input.referer ?? context.request.headers.get('referer')
    if (!referer) throw new Error('Missing referer!')
    const route = new URL(referer).pathname
    if (!route) throw new Error('Missing route or referer!')
    Metrics.incrementPageViews(route)
    return Metrics.getPageMetrics(route)
  },
})
