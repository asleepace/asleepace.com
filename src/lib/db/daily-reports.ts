import { z } from 'zod'
import { sql } from './db'

export const DailyReportSchema = z.object({
  id: z.number().int().positive().optional(),
  date: z.coerce.date(), // Accepts Date or string, coerces to Date
  text: z.string().min(1),
  data: z.union([z.record(z.unknown()), z.string().transform((str) => JSON.parse(str))]).default({}),
  accuracy: z.coerce.number().optional().default(0),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
})

// For inserts (without auto-generated fields)
export const CreateDailyReportSchema = DailyReportSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

// For updates (all fields optional except id)
export const UpdateDailyReportSchema = DailyReportSchema.partial().required({ id: true })
export type DailyReport = z.infer<typeof DailyReportSchema>
export type CreateDailyReport = z.infer<typeof CreateDailyReportSchema>
export type UpdateDailyReport = z.infer<typeof UpdateDailyReportSchema>

/**
 * Fetch a daily report by date
 */
export async function getDailyReport({ date }: { date: Date | string }): Promise<DailyReport | null> {
  const reportDate = typeof date === 'string' ? new Date(date) : date
  const results = await sql`
    SELECT * FROM daily_reports 
    WHERE date = ${reportDate.toISOString().split('T')[0]}
    LIMIT 1
  `
  if (results.length === 0) return null
  return DailyReportSchema.parse(results[0])
}

/**
 * Fetch daily reports within a date range
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
    SELECT * FROM daily_reports 
    WHERE date BETWEEN ${start.toISOString().split('T')[0]} 
              AND ${end.toISOString().split('T')[0]}
    ORDER BY date DESC
  `
  return results.map((r) => DailyReportSchema.parse(r))
}

/**
 * Fetch the most recent N reports
 */
export async function getRecentReports({ limit = 10 }): Promise<DailyReport[]> {
  const results = await sql`
    SELECT * FROM daily_reports 
    ORDER BY date DESC 
    LIMIT ${limit}
  `
  return results.map((r) => DailyReportSchema.parse(r))
}

/**
 * Upsert a daily report (insert or update if exists)
 */
export async function upsertDailyReport(report: CreateDailyReport): Promise<DailyReport> {
  const validated = CreateDailyReportSchema.parse(report)
  const reportDate = typeof validated.date === 'string' ? validated.date : validated.date.toISOString().split('T')[0]

  const results = await sql`
    INSERT INTO daily_reports (date, text, data, accuracy)
    VALUES (
      ${reportDate},
      ${validated.text},
      ${JSON.stringify(validated.data)},
      ${validated.accuracy}
    )
    ON CONFLICT (date) DO UPDATE 
    SET 
      text = EXCLUDED.text,
      data = EXCLUDED.data,
      accuracy = EXCLUDED.accuracy,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `

  return DailyReportSchema.parse(results[0])
}

/**
 * Update a daily report by date with partial data
 */
export async function updateDailyReport(date: Date, updates: Partial<DailyReport>): Promise<DailyReport | null> {
  const reportDate =
    typeof date === 'string' ? new Date(date).toISOString().split('T')[0] : date.toISOString().split('T')[0]

  // Build dynamic SET clause
  const setClauses: string[] = []
  const values: any[] = []

  if (updates.text !== undefined) {
    setClauses.push(`text = $${values.length + 1}`)
    values.push(updates.text)
  }

  if (updates.data !== undefined) {
    setClauses.push(`data = $${values.length + 1}`)
    values.push(JSON.stringify(updates.data))
  }

  if (updates.accuracy !== undefined) {
    setClauses.push(`accuracy = $${values.length + 1}`)
    values.push(updates.accuracy)
  }

  // Always update updated_at
  setClauses.push('updated_at = CURRENT_TIMESTAMP')

  if (setClauses.length === 1) {
    // Only updated_at, nothing to update
    return getDailyReport({ date })
  }

  const results = await sql.unsafe(
    `UPDATE daily_reports 
     SET ${setClauses.join(', ')}
     WHERE date = $${values.length + 1}
     RETURNING *`,
    [...values, reportDate]
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

  // Get previous report
  const previousResults = await sql`
    SELECT * FROM daily_reports 
    WHERE date < ${reportDate}
    ORDER BY date DESC 
    LIMIT 1
  `

  // Get next report
  const nextResults = await sql`
    SELECT * FROM daily_reports 
    WHERE date > ${reportDate}
    ORDER BY date ASC 
    LIMIT 1
  `

  return {
    previous: previousResults.length > 0 ? DailyReportSchema.parse(previousResults[0]) : null,
    next: nextResults.length > 0 ? DailyReportSchema.parse(nextResults[0]) : null,
  }
}
