/**
 * @file src/lib/db/daily-reports.ts
 * @description logic for daily reports database.
 */

import { z } from 'zod'
import { sql } from './db'

export const DailyReportSchema = z.object({
  id: z.number().int().positive().optional(),
  market_date: z.coerce.date(),
  summary: z.string().min(1),
  initial: z.string().optional().default(''),
  data: z.union([z.record(z.unknown()), z.string().transform((str) => JSON.parse(str))]).default({}),
  meta: z.union([z.record(z.unknown()), z.string().transform((str) => JSON.parse(str))]).default({}),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
})

export const CreateDailyReportSchema = DailyReportSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const UpdateDailyReportSchema = DailyReportSchema.partial().required({ id: true })

export type DailyReport = z.infer<typeof DailyReportSchema>
export type CreateDailyReport = z.infer<typeof CreateDailyReportSchema>
export type UpdateDailyReport = z.infer<typeof UpdateDailyReportSchema>

/**
 * Fetch the most recent daily report for a given date
 */
export async function getDailyReport({ date }: { date: Date | string }): Promise<DailyReport | null> {
  const reportDate = typeof date === 'string' ? new Date(date) : date
  const marketDate = reportDate.toISOString().split('T')[0]
  console.log('[db] get daily report for:', marketDate)
  const results = await sql`
    SELECT * FROM daily_reports 
    WHERE market_date = ${marketDate}
    ORDER BY created_at DESC
    LIMIT 1
  `
  if (results.length === 0) return null
  return DailyReportSchema.parse(results[0])
}

/**
 * Fetch all daily reports for a given date (including history)
 */
export async function getAllDailyReports({ date }: { date: Date | string }): Promise<DailyReport[]> {
  const reportDate = typeof date === 'string' ? new Date(date) : date
  const results = await sql`
    SELECT * FROM daily_reports 
    WHERE market_date = ${reportDate.toISOString().split('T')[0]}
    ORDER BY created_at DESC
  `
  return results.map((r) => DailyReportSchema.parse(r))
}

/**
 * Fetch daily reports within a date range (most recent per date)
 */
export async function getDailyReports({
  startDate,
  endDate,
}: {
  startDate: Date | string
  endDate: Date | string
}): Promise<DailyReport[]> {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  const results = await sql`
    SELECT DISTINCT ON (market_date) * FROM daily_reports 
    WHERE market_date BETWEEN ${start.toISOString().split('T')[0]} 
              AND ${end.toISOString().split('T')[0]}
    ORDER BY market_date DESC, created_at DESC
  `
  return results.map((r) => DailyReportSchema.parse(r))
}

/**
 * Fetch the most recent N reports (latest per market_date)
 */
export async function getRecentReports({ limit = 10 }): Promise<DailyReport[]> {
  const results = await sql`
    SELECT DISTINCT ON (market_date) * FROM daily_reports 
    ORDER BY market_date DESC, created_at DESC
    LIMIT ${limit}
  `
  return results.map((r) => DailyReportSchema.parse(r))
}

/**
 * Create a new daily report (always inserts, allows multiple per date)
 */
export async function createDailyReport(report: CreateDailyReport): Promise<DailyReport> {
  const validated = CreateDailyReportSchema.parse(report)
  const reportDate =
    typeof validated.market_date === 'string'
      ? validated.market_date
      : validated.market_date.toISOString().split('T')[0]

  const results = await sql`
    INSERT INTO daily_reports (market_date, summary, initial, data, meta)
    VALUES (
      ${reportDate},
      ${validated.summary},
      ${validated.initial ?? validated.summary},
      ${JSON.stringify(validated.data)},
      ${JSON.stringify(validated.meta)}
    )
    RETURNING *
  `

  return DailyReportSchema.parse(results[0])
}

/**
 * Update a specific daily report by id
 */
export async function updateDailyReport(
  id: number,
  updates: Partial<Omit<DailyReport, 'id'>>
): Promise<DailyReport | null> {
  const setClauses: string[] = []
  const values: any[] = []

  if (updates.summary !== undefined) {
    setClauses.push(`summary = $${values.length + 1}`)
    values.push(updates.summary)
  }

  if (updates.initial !== undefined) {
    setClauses.push(`initial = $${values.length + 1}`)
    values.push(updates.initial)
  }

  if (updates.data !== undefined) {
    setClauses.push(`data = $${values.length + 1}`)
    values.push(JSON.stringify(updates.data))
  }

  if (updates.meta !== undefined) {
    setClauses.push(`meta = $${values.length + 1}`)
    values.push(JSON.stringify(updates.meta))
  }

  if (setClauses.length === 0) {
    // Nothing to update
    const results = await sql`SELECT * FROM daily_reports WHERE id = ${id}`
    return results.length > 0 ? DailyReportSchema.parse(results[0]) : null
  }

  const results = await sql.unsafe(
    `UPDATE daily_reports 
     SET ${setClauses.join(', ')}
     WHERE id = $${values.length + 1}
     RETURNING *`,
    [...values, id]
  )

  if (results.length === 0) return null
  return DailyReportSchema.parse(results[0])
}

/**
 * Get the next and previous reports relative to a given date
 */
export async function getAdjacentReports({ date }: { date: Date | string }): Promise<{
  previous: DailyReport | null
  next: DailyReport | null
}> {
  const reportDate =
    typeof date === 'string' ? new Date(date).toISOString().split('T')[0] : date.toISOString().split('T')[0]

  const previousResults = await sql`
    SELECT DISTINCT ON (market_date) * FROM daily_reports 
    WHERE market_date < ${reportDate}
    ORDER BY market_date DESC, created_at DESC
    LIMIT 1
  `

  const nextResults = await sql`
    SELECT DISTINCT ON (market_date) * FROM daily_reports 
    WHERE market_date > ${reportDate}
    ORDER BY market_date ASC, created_at DESC
    LIMIT 1
  `

  return {
    previous: previousResults.length > 0 ? DailyReportSchema.parse(previousResults[0]) : null,
    next: nextResults.length > 0 ? DailyReportSchema.parse(nextResults[0]) : null,
  }
}
