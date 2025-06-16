import { defineAction } from 'astro:actions'
import { z } from 'astro:content'
import { db, PageMetrics, sql } from 'astro:db'

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
          likes: input.unliked ? sql`likes - 1` : sql`likes + 1`,
          updatedAt: new Date(),
        },
      })
      .returning()
      .get()

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
    const referer = input.referer ?? context.request.headers.get('referer')
    if (!referer) throw new Error('Missing referer!')
    const route = new URL(referer).pathname
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

    return pageMetrics
  },
})
