/**
 * @file src/lib/db/logs.ts
 * @description Logic for event logs database.
 */

import { z } from 'zod'
import { sql } from './db'

export const LogSchema = z.object({
  id: z.number().int().positive(),
  type: z.string().default('log'),
  text: z.string().min(1),
  created_at: z.date(),
})

export const CreateLogSchema = LogSchema.omit({
  id: true,
  created_at: true,
})

export type Log = z.infer<typeof LogSchema>
export type CreateLog = z.infer<typeof CreateLogSchema>

/**
 * Insert a log entry
 */
export async function createLog(log: CreateLog): Promise<Log> {
  const validated = CreateLogSchema.parse(log)
  const results = await sql`
    INSERT INTO logs (type, text)
    VALUES (${validated.type}, ${validated.text})
    RETURNING *
  `
  return LogSchema.parse(results[0])
}

/**
 * Persists a log to the database.
 */
export function logEvent(log: CreateLog): void {
  console.log(`[logs::${log.type}] ${log.text}`)
  createLog(log).catch((e) => console.warn('[db] failed to create log:', e))
}

export function logMessage(text: string): void {
  logEvent({ type: 'message', text })
}

/**
 * Persists an error to the database, handles casting to error object internally.
 * Logs message to console as well.
 */
export function logError(e: unknown, source?: string): void {
  const prefix = source ? `[${source}] ` : ''
  const error = e instanceof Error ? e : new Error(String(e))
  console.warn(`[logs::${error}${source ? `::${source}` : ''}] ${error.message}`)
  createLog({
    type: 'error',
    text: `${prefix}${error.message}`,
  })
}

/**
 * Get recent logs with optional type filter
 */
export async function getLogs({
  limit = 100,
  type,
}: {
  limit?: number
  type?: string
} = {}): Promise<Log[]> {
  const results = type
    ? await sql`
        SELECT * FROM logs 
        WHERE type = ${type}
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `
    : await sql`
        SELECT * FROM logs 
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `

  return results.map((r) => LogSchema.parse(r))
}

/**
 * Get logs within a time range
 */
export async function getLogsByTimeRange({
  startDate,
  endDate,
  type,
}: {
  startDate: Date
  endDate: Date
  type?: string
}): Promise<Log[]> {
  const results = type
    ? await sql`
        SELECT * FROM logs 
        WHERE created_at BETWEEN ${startDate} AND ${endDate}
          AND type = ${type}
        ORDER BY created_at DESC
      `
    : await sql`
        SELECT * FROM logs 
        WHERE created_at BETWEEN ${startDate} AND ${endDate}
        ORDER BY created_at DESC
      `

  return results.map((r) => LogSchema.parse(r))
}
