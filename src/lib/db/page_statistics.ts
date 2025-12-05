/**
 * @file src/lib/db/page-stats.ts
 * @description logic for page statistics database.
 */

import { z } from 'zod'
import { sql } from './db'

export const PageStatsSchema = z.object({
  path: z.string(),
  page_views: z.number().int().default(0),
  page_likes: z.number().int().default(0),
  comments: z.union([z.array(z.unknown()), z.string().transform((str) => JSON.parse(str))]).default([]),
  meta: z.union([z.record(z.unknown()), z.string().transform((str) => JSON.parse(str))]).default({}),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
})

export const CreatePageStatsSchema = PageStatsSchema.omit({
  created_at: true,
  updated_at: true,
})

export const UpdatePageStatsSchema = PageStatsSchema.partial().required({ path: true })

export type PageStats = z.infer<typeof PageStatsSchema>
export type CreatePageStats = z.infer<typeof CreatePageStatsSchema>
export type UpdatePageStats = z.infer<typeof UpdatePageStatsSchema>

/**
 * Fetch page stats by path
 */
export async function getPageStats({ path }: { path: string }): Promise<PageStats | null> {
  const results = await sql`
    SELECT * FROM page_stats 
    WHERE path = ${path}
    LIMIT 1
  `
  if (results.length === 0) return null
  return PageStatsSchema.parse(results[0])
}

/**
 * Fetch all page stats
 */
export async function getAllPageStats(): Promise<PageStats[]> {
  const results = await sql`
    SELECT * FROM page_stats 
    ORDER BY page_views DESC
  `
  return results.map((r) => PageStatsSchema.parse(r))
}

/**
 * Fetch top N pages by views
 */
export async function getTopPagesByViews({ limit = 10 }: { limit?: number }): Promise<PageStats[]> {
  const results = await sql`
    SELECT * FROM page_stats 
    ORDER BY page_views DESC 
    LIMIT ${limit}
  `
  return results.map((r) => PageStatsSchema.parse(r))
}

/**
 * Fetch top N pages by likes
 */
export async function getTopPagesByLikes({ limit = 10 }: { limit?: number }): Promise<PageStats[]> {
  const results = await sql`
    SELECT * FROM page_stats 
    ORDER BY page_likes DESC 
    LIMIT ${limit}
  `
  return results.map((r) => PageStatsSchema.parse(r))
}

/**
 * Upsert page stats (insert or update if exists)
 */
export async function upsertPageStats(stats: CreatePageStats): Promise<PageStats> {
  const validated = CreatePageStatsSchema.parse(stats)

  const results = await sql`
    INSERT INTO page_stats (path, page_views, page_likes, comments, meta)
    VALUES (
      ${validated.path},
      ${validated.page_views},
      ${validated.page_likes},
      ${JSON.stringify(validated.comments)},
      ${JSON.stringify(validated.meta)}
    )
    ON CONFLICT (path) DO UPDATE 
    SET 
      page_views = EXCLUDED.page_views,
      page_likes = EXCLUDED.page_likes,
      comments = EXCLUDED.comments,
      meta = EXCLUDED.meta
    RETURNING *
  `

  return PageStatsSchema.parse(results[0])
}

/**
 * Increment page views for a path
 */
export async function incrementPageViews({ path }: { path: string }): Promise<PageStats> {
  const results = await sql`
    INSERT INTO page_stats (path, page_views)
    VALUES (${path}, 1)
    ON CONFLICT (path) DO UPDATE 
    SET page_views = page_stats.page_views + 1
    RETURNING *
  `

  return PageStatsSchema.parse(results[0])
}

/**
 * Increment page likes for a path
 */
export async function incrementPageLikes({ path }: { path: string }): Promise<PageStats> {
  const results = await sql`
    INSERT INTO page_stats (path, page_likes)
    VALUES (${path}, 1)
    ON CONFLICT (path) DO UPDATE 
    SET page_likes = page_stats.page_likes + 1
    RETURNING *
  `

  return PageStatsSchema.parse(results[0])
}

/**
 * Decrement page likes for a path (minimum 0)
 */
export async function decrementPageLikes({ path }: { path: string }): Promise<PageStats> {
  const results = await sql`
    UPDATE page_stats 
    SET page_likes = GREATEST(0, page_likes - 1)
    WHERE path = ${path}
    RETURNING *
  `

  if (results.length === 0) {
    // Path doesn't exist, create with 0 likes
    return upsertPageStats({ path, page_views: 0, page_likes: 0, comments: [], meta: {} })
  }

  return PageStatsSchema.parse(results[0])
}

/**
 * Add a comment to a page
 */
export async function addComment({ path, comment }: { path: string; comment: unknown }): Promise<PageStats> {
  const results = await sql`
    INSERT INTO page_stats (path, comments)
    VALUES (${path}, ${JSON.stringify([comment])})
    ON CONFLICT (path) DO UPDATE 
    SET comments = page_stats.comments || ${JSON.stringify([comment])}::jsonb
    RETURNING *
  `

  return PageStatsSchema.parse(results[0])
}

/**
 * Update page stats by path
 */
export async function updatePageStats(
  path: string,
  updates: Partial<Omit<PageStats, 'path' | 'created_at' | 'updated_at'>>
): Promise<PageStats | null> {
  const setClauses: string[] = []
  const values: any[] = []

  if (updates.page_views !== undefined) {
    setClauses.push(`page_views = $${values.length + 1}`)
    values.push(updates.page_views)
  }

  if (updates.page_likes !== undefined) {
    setClauses.push(`page_likes = $${values.length + 1}`)
    values.push(updates.page_likes)
  }

  if (updates.comments !== undefined) {
    setClauses.push(`comments = $${values.length + 1}`)
    values.push(JSON.stringify(updates.comments))
  }

  if (updates.meta !== undefined) {
    setClauses.push(`meta = $${values.length + 1}`)
    values.push(JSON.stringify(updates.meta))
  }

  if (setClauses.length === 0) {
    return getPageStats({ path })
  }

  const results = await sql.unsafe(
    `UPDATE page_stats 
     SET ${setClauses.join(', ')}
     WHERE path = $${values.length + 1}
     RETURNING *`,
    [...values, path]
  )

  if (results.length === 0) return null
  return PageStatsSchema.parse(results[0])
}

/**
 * Delete page stats by path
 */
export async function deletePageStats({ path }: { path: string }): Promise<boolean> {
  const results = await sql`
    DELETE FROM page_stats 
    WHERE path = ${path}
    RETURNING path
  `
  return results.length > 0
}

/**
 * Get total stats across all pages
 */
export async function getTotalStats(): Promise<{
  totalPages: number
  totalViews: number
  totalLikes: number
  totalComments: number
}> {
  const results = await sql`
    SELECT 
      COUNT(*) as total_pages,
      COALESCE(SUM(page_views), 0) as total_views,
      COALESCE(SUM(page_likes), 0) as total_likes,
      COALESCE(SUM(jsonb_array_length(comments)), 0) as total_comments
    FROM page_stats
  `

  const row = results[0]
  return {
    totalPages: parseInt(row?.total_pages || '0'),
    totalViews: parseInt(row?.total_views || '0'),
    totalLikes: parseInt(row?.total_likes || '0'),
    totalComments: parseInt(row?.total_comments || '0'),
  }
}
