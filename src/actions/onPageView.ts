import type { Metric } from '@/db/index.server'
import { defineAction, type ActionAPIContext } from 'astro:actions'
import { z } from 'astro:content'

function getReferer(context: ActionAPIContext) {
  const referer = context.request.headers.get('referer')
  if (!referer) throw new Error('No referer provided!')
  return referer
}

async function fetchMetrics(context: ActionAPIContext, referer: string, method: 'GET' | 'PUT' | 'DELETE') {
  const url = new URL('/api/metrics', context.url.origin)
  const response = await fetch(url, { method, headers: { referer } })
  if (!response.ok) {
    console.error('[onPageView] failed to fetch metrics', response)
    throw new Error('Failed to register page like!')
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
    const url = new URL('/api/metrics', context.url.origin)
    const response = await fetch(url, { method: input.unliked ? 'DELETE' : 'PUT', headers: { referer } })
    if (response.redirected) {
      throw new Error('Not authorized!')
    }
    if (!response.ok) {
      throw new Error('Failed to register page like!')
    }
    const pageMetrics: Metric = await response.json()
    return pageMetrics
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
    const referer = input.referer ?? getReferer(context)
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
