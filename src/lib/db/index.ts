import { checkIfConnected, shutdown, sql } from './db'

/**
 * Postgres Database helpers.
 */
export const db = {
  checkIfConnected,
  shutdown,
  sql,
} as const
