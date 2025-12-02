/**
 * @file src/lib/db/db.ts
 * @description Postgres database for asleepace.com
 */
import postgres from 'postgres'

console.log(
  `[db] connecting to db "${import.meta.env.POSTGRES_DATABASE}" on ${import.meta.env.POSTGRES_HOST}:${
    import.meta.env.POSTGRES_PORT
  }`
)

/**
 * Postgres SQL Instance for asleepace.com
 */
export const sql = postgres({
  host: import.meta.env.POSTGRES_HOST,
  port: import.meta.env.POSTGRES_PORT,
  database: import.meta.env.POSTGRES_DATABASE,
  username: import.meta.env.POSTGRES_USERNAME,
  password: import.meta.env.POSTGRES_PASSWORD,
  max: 10, // max connections
  idle_timeout: 20,
})

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
