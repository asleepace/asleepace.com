import { checkIfConnected, sql } from './db'

/**
 * Postgres Database helpers.
 */
export const db = {
  checkIfConnected,
  sql,
} as const
