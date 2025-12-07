/**
 * @file src/lib/db/db.ts
 * @description Postgres database for asleepace.com
 */
import postgres from 'postgres'

/**
 * NOTE: These are set in astro.config.mjs
 */
import { POSTGRES_PASSWORD, POSTGRES_USERNAME, POSTGRES_DATABASE, POSTGRES_PORT, POSTGRES_HOST } from 'astro:env/server'

console.log(`[db] connecting to db "${POSTGRES_DATABASE}" on ${POSTGRES_HOST}:${POSTGRES_PORT}`)

/**
 * Set global db for hot reloads
 */
const globalForDb = globalThis as unknown as {
  sql: postgres.Sql | undefined
}

/**
 * Postgres SQL Instance for asleepace.com
 */
export const sql =
  globalForDb.sql ??
  postgres({
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    database: POSTGRES_DATABASE,
    username: POSTGRES_USERNAME,
    password: POSTGRES_PASSWORD,
    max: 25, // max connections
    idle_timeout: 20,
  })

/**
 * Prevent reconnecting during development + hot reloads.
 */
if (!import.meta.env.PROD) {
  globalForDb.sql = sql
}

/**
 * Setup insert event hooks.
 */
sql.listen('data_inserted', async (payload) => {
  try {
    const json = JSON.parse(payload)
    console.log('[db::hook] json:', json)
  } catch (e) {
    console.warn('[db::hook] error:', e)
  }
})

/**
 * Shutdown the Postgres connection. Should be called when application terminates.
 */
export async function shutdown(): Promise<void> {
  try {
    console.log('[db] shutting down...')
    await sql.end()
  } catch (e) {
    console.warn('[db] shutdown failed:', e)
  }
}

/**
 * Checks if the Postgres database is connected.
 */
export async function checkIfConnected(): Promise<boolean> {
  try {
    const [dbInfo] = await sql`SELECT version()`
    if (!dbInfo || !dbInfo.version) {
      throw new Error('Postgres database is not connected!')
    }
    console.log('[db] postgres:', { version: dbInfo.version })
    return true
  } catch (e) {
    console.warn('[db] error:', e)
    return false
  }
}
