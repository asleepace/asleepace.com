import { defineAction } from 'astro:actions'
import { z } from 'astro:content'
import { db, PageMetrics, sql } from 'astro:db'

export const onPageView = defineAction({
  input: z.object({
    route: z.string(),
  }),
  async handler(input, context) {
    try {
      console.log('[actions] onPageView:', context.url)

      // use route as unique key
      // const route = context.url.pathname
      const route = input.route

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
      console.warn('[actions] failed to update page metrics:', e)
      return undefined
    }
  },
})
