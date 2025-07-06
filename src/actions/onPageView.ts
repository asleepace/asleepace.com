import type { Metric } from '@/db/index.server'
import { defineAction } from 'astro:actions'
import { z } from 'astro:content'

/**
 *  Update the page's likes metric by 1 or -1.
 */
export const onPageLike = defineAction({
  input: z.object({
    referer: z.string().optional(),
    unliked: z.boolean().default(false),
  }),
  async handler(input, context) {
    try {
      console.log(context.originPathname)
      console.log(context.request.referrer)

      const url = new URL('/api/metrics', context.url.origin)
      console.log(url)
      return
      const response = await fetch(url, { method: input.unliked ? 'DELETE' : 'PUT' })
      if (!response.ok) {
        throw new Error('Failed to register page like!')
      }
      const pageMetrics: Metric = await response.json()
      return pageMetrics
    } catch (e) {
      console.error(e)
    }
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

    if (!referer) {
      throw new Error('No referer provided!')
    }

    const url = new URL('/api/metrics', context.url.origin)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        referer,
      },
    })
    if (response.redirected) {
      throw new Error('Redirected to a different page!')
    }
    if (!response.ok) {
      throw new Error('Failed to register page view!')
    }
    const metrics: Metric = await response.json()
    return metrics
  },
})
