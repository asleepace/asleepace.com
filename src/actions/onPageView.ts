import type { Metric } from '@/db/index.server'
import { defineAction, type ActionAPIContext } from 'astro:actions'
import { z } from 'astro:content'

function getReferer(context: ActionAPIContext) {
  const referer = context.request.headers.get('referer')
  if (!referer) throw new Error('No referer provided!')
  return referer
}

async function fetchMetrics({
  context,
  referer,
  method,
}: {
  context: ActionAPIContext
  referer: string
  method: 'GET' | 'PUT' | 'DELETE'
}): Promise<Metric> {
  const url = new URL('/api/metrics', context.url.origin)
  const response = await fetch(url, { method, headers: { referer } })
  if (response.redirected) {
    throw new Error('Not authorized!')
  }
  if (!response.ok) {
    console.error('[onPageView] failed to fetch metrics', response)
    throw new Error('Invalid metric referer!')
  }
  return response.json()
}

/**
 *  Update the page's likes metric by 1 or -1.
 */
export const onPageLike = defineAction({
  input: z.object({
    referer: z.string().optional(),
    unliked: z.boolean().default(false),
  }),
  async handler(input, context) {
    const referer = input.referer ?? getReferer(context)
    const method = input.unliked ? 'DELETE' : 'PUT'
    const metrics = await fetchMetrics({ context, referer, method })
    return metrics
  },
})

/**
 *  Increment the page's views and return the updated metrics.
 */
export const onPageView = defineAction({
  input: z.object({
    referer: z.string().optional(),
  }),
  async handler(input, context) {
    try {
      const referer = input.referer ?? getReferer(context)
      const metrics = await fetchMetrics({ context, referer, method: 'GET' })
      console.log('[onPageView] referer:', referer, metrics)
      return metrics
    } catch (e) {
      console.error('[onPageView] failed to fetch metrics', e)
      throw e
    }
  },
})
