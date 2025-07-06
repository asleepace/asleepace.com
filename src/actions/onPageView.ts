import type { Metric } from '@/db'
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
    const response = await fetch('/api/metrics', { method: input.unliked ? 'DELETE' : 'PUT' })
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
    const response = await fetch('/api/metrics', { method: 'GET' })
    if (!response.ok) {
      throw new Error('Failed to register page view!')
    }
    const pageMetrics: Metric = await response.json()
    return pageMetrics
  },
})
