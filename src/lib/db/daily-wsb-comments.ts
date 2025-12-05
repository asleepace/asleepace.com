/**
 * @file src/lib/db/daily-wsb-comments.ts
 * @description logic for daily WSB comments database.
 */

import { z } from 'zod'
import { sql } from './db'

export const DailyWSBCommentSchema = z.object({
  id: z.string().nullable().default(crypto.randomUUID()),
  market_date: z.coerce.date(),
  author: z.string().nullable().default('anonymous'),
  score: z.number().int(),
  timestamp: z.coerce.date(),
  flair: z.string().nullable(),
  body: z.string().min(1),
  parent_id: z.string().nullable(),
  meta: z.union([z.record(z.unknown()), z.string().transform((str) => JSON.parse(str))]).default({}),
  created_at: z.date().optional(),
})

export const CreateDailyWSBCommentSchema = DailyWSBCommentSchema.omit({
  created_at: true,
})

export const UpdateDailyWSBCommentSchema = DailyWSBCommentSchema.partial().required({ id: true })

export type DailyWSBComment = z.infer<typeof DailyWSBCommentSchema>
export type CreateDailyWSBComment = z.infer<typeof CreateDailyWSBCommentSchema>
export type UpdateDailyWSBComment = z.infer<typeof UpdateDailyWSBCommentSchema>

/**
 * Fetch a single comment by ID
 */
export async function getComment({ id }: { id: string }): Promise<DailyWSBComment | null> {
  const results = await sql`
    SELECT * FROM daily_wsb_comments 
    WHERE id = ${id}
    LIMIT 1
  `
  if (results.length === 0) return null
  return DailyWSBCommentSchema.parse(results[0])
}

/**
 * Fetch all comments for a given market date
 */
export async function getCommentsByDate({ date }: { date: Date | string }): Promise<DailyWSBComment[]> {
  const reportDate = typeof date === 'string' ? new Date(date) : date
  const results = await sql`
    SELECT * FROM daily_wsb_comments 
    WHERE market_date = ${reportDate.toISOString().split('T')[0]}
    ORDER BY score DESC, timestamp DESC
  `
  return results.map((r) => DailyWSBCommentSchema.parse(r))
}

/**
 * Fetch top-level comments (no parent) for a given date
 */
export async function getTopLevelComments({
  date,
  limit = 100,
}: {
  date: Date | string
  limit?: number
}): Promise<DailyWSBComment[]> {
  const reportDate = typeof date === 'string' ? new Date(date) : date
  const results = await sql`
    SELECT * FROM daily_wsb_comments 
    WHERE market_date = ${reportDate.toISOString().split('T')[0]}
      AND parent_id IS NULL
    ORDER BY score DESC, timestamp DESC
    LIMIT ${limit}
  `
  return results.map((r) => DailyWSBCommentSchema.parse(r))
}

/**
 * Fetch replies for a given comment
 */
export async function getReplies({ parentId }: { parentId: string }): Promise<DailyWSBComment[]> {
  const results = await sql`
    SELECT * FROM daily_wsb_comments 
    WHERE parent_id = ${parentId}
    ORDER BY score DESC, timestamp DESC
  `
  return results.map((r) => DailyWSBCommentSchema.parse(r))
}

/**
 * Fetch comments within a date range
 */
export async function getComments({
  startDate,
  endDate,
}: {
  startDate: Date | string
  endDate: Date | string
}): Promise<DailyWSBComment[]> {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  const results = await sql`
    SELECT * FROM daily_wsb_comments 
    WHERE market_date BETWEEN ${start.toISOString().split('T')[0]} 
              AND ${end.toISOString().split('T')[0]}
    ORDER BY market_date DESC, score DESC
  `
  return results.map((r) => DailyWSBCommentSchema.parse(r))
}

/**
 * Upsert a comment (insert or update if exists)
 */
export async function upsertComment(comment: CreateDailyWSBComment): Promise<DailyWSBComment> {
  const validated = CreateDailyWSBCommentSchema.parse(comment)
  const marketDate =
    typeof validated.market_date === 'string'
      ? validated.market_date
      : validated.market_date.toISOString().split('T')[0]
  const timestamp = typeof validated.timestamp === 'string' ? validated.timestamp : validated.timestamp.toISOString()

  const results = await sql`
    INSERT INTO daily_wsb_comments (
      id, market_date, author, score, timestamp, flair, body, parent_id, meta
    )
    VALUES (
      ${validated.id},
      ${marketDate},
      ${validated.author},
      ${validated.score},
      ${timestamp},
      ${validated.flair},
      ${validated.body},
      ${validated.parent_id},
      ${JSON.stringify(validated.meta)}
    )
    ON CONFLICT (id) DO UPDATE 
    SET 
      author = EXCLUDED.author,
      score = EXCLUDED.score,
      flair = EXCLUDED.flair,
      body = EXCLUDED.body,
      meta = EXCLUDED.meta
    RETURNING *
  `

  return DailyWSBCommentSchema.parse(results[0])
}

/**
 * Bulk upsert comments
 */
export async function bulkUpsertComments(comments: CreateDailyWSBComment[]): Promise<number> {
  if (comments.length === 0) return 0

  console.log({ commnets_preview: comments.slice(0, 1) })

  const validated = comments.map((c) => CreateDailyWSBCommentSchema.parse(c))

  for (const comment of validated) {
    await upsertComment(comment)
  }

  return validated.length
}

/**
 * Update a comment by ID
 */
export async function updateComment(
  id: string,
  updates: Partial<Omit<DailyWSBComment, 'id' | 'created_at'>>
): Promise<DailyWSBComment | null> {
  const setClauses: string[] = []
  const values: any[] = []

  if (updates.author !== undefined) {
    setClauses.push(`author = $${values.length + 1}`)
    values.push(updates.author)
  }

  if (updates.score !== undefined) {
    setClauses.push(`score = $${values.length + 1}`)
    values.push(updates.score)
  }

  if (updates.flair !== undefined) {
    setClauses.push(`flair = $${values.length + 1}`)
    values.push(updates.flair)
  }

  if (updates.body !== undefined) {
    setClauses.push(`body = $${values.length + 1}`)
    values.push(updates.body)
  }

  if (updates.meta !== undefined) {
    setClauses.push(`meta = $${values.length + 1}`)
    values.push(JSON.stringify(updates.meta))
  }

  if (setClauses.length === 0) {
    return getComment({ id })
  }

  const results = await sql.unsafe(
    `UPDATE daily_wsb_comments 
     SET ${setClauses.join(', ')}
     WHERE id = $${values.length + 1}
     RETURNING *`,
    [...values, id]
  )

  if (results.length === 0) return null
  return DailyWSBCommentSchema.parse(results[0])
}

/**
 * Delete a comment by ID (will cascade to replies)
 */
export async function deleteComment({ id }: { id: string }): Promise<boolean> {
  const results = await sql`
    DELETE FROM daily_wsb_comments 
    WHERE id = ${id}
    RETURNING id
  `
  return results.length > 0
}

/**
 * Get comment statistics for a given date
 */
export async function getCommentStats({ date }: { date: Date | string }): Promise<{
  total: number
  topLevel: number
  avgScore: number
  topAuthors: Array<{ author: string; count: number }>
}> {
  const reportDate = typeof date === 'string' ? new Date(date) : date
  const dateStr = reportDate.toISOString().split('T')[0]

  const [totalResult, topLevelResult, avgScoreResult, topAuthorsResult] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM daily_wsb_comments WHERE market_date = ${dateStr}`,
    sql`SELECT COUNT(*) as count FROM daily_wsb_comments WHERE market_date = ${dateStr} AND parent_id IS NULL`,
    sql`SELECT AVG(score) as avg FROM daily_wsb_comments WHERE market_date = ${dateStr}`,
    sql`
      SELECT author, COUNT(*) as count 
      FROM daily_wsb_comments 
      WHERE market_date = ${dateStr}
      GROUP BY author 
      ORDER BY count DESC 
      LIMIT 10
    `,
  ])

  return {
    total: parseInt(totalResult[0]?.count || '0'),
    topLevel: parseInt(topLevelResult[0]?.count || '0'),
    avgScore: parseFloat(avgScoreResult[0]?.avg || '0'),
    topAuthors: topAuthorsResult.map((r) => ({
      author: r.author,
      count: parseInt(r.count),
    })),
  }
}
