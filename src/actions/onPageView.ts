import { defineAction } from 'astro:actions'
import { z } from 'astro:content'
import { db, PageMetrics, sql } from 'astro:db'

export const onPageView = defineAction({
  input: z.object({
    referer: z.string().optional(),
  }),
  async handler(input, context) {
    try {
      const referer = input.referer ?? context.request.headers.get('referer')

      if (!referer) throw new Error('Missing referer!')

      const route = new URL(referer).pathname
      console.log('[actions] onPageView:', route)

      if (!route) throw new Error('Missing route or referer!')

      // insert or update page metrics and incrament
      const pageMetrics = await db
        .insert(PageMetrics)
        .values({
          route,
          views: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: PageMetrics.route,
          set: {
            views: sql`views + 1`,
            updatedAt: new Date(),
          },
        })
        .returning()
        .get()

      console.log('[actions] page metrics:', pageMetrics)

      // set context locals for page metrics
      context.locals.pageMetrics = pageMetrics

      return pageMetrics
    } catch (e) {
      console.warn('[actions] onPageView:', e)
      return undefined
    }
  },
})
