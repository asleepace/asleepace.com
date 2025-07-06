import Database from 'bun:sqlite'

export type Analytic = {
  id: number
  path: string
  createdAt: Date
  userAgent: string
  ipAddress: string
  referrer: string
  sessionId: string
}

export namespace Analytics {
  let db: Database

  const ANALYTICS_INIT = `
    CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        userAgent TEXT,
        ipAddress TEXT,
        sessionId TEXT,
        referrer TEXT
    );
  `

  export function attachAnalyticsTable(sharedDatabaseInstance: Database) {
    console.log('[db][analytics] attaching table...')
    db = sharedDatabaseInstance
    db.run(ANALYTICS_INIT)
  }

  export function track(data: {
    path: string
    userAgent?: string | null
    ipAddress?: string | null
    sessionId?: string | null
    referrer?: string | null
  }) {
    const query = db.prepare(`
      INSERT INTO analytics (path, userAgent, ipAddress, sessionId, referrer)
      VALUES ($path, $userAgent, $ipAddress, $sessionId, $referrer)
      RETURNING *;
    `)

    const result = query.run({
      $path: data.path ?? '/',
      $userAgent: data.userAgent ?? null,
      $ipAddress: data.ipAddress ?? null,
      $sessionId: data.sessionId ?? null,
      $referrer: data.referrer ?? null,
    })

    return result.lastInsertRowid
  }

  export function fetchAnalytics({ limit = 100, offset = 0 }: { limit?: number; offset?: number }): Analytic[] {
    if (limit < 0 || offset < 0) {
      throw new Error('Limit and offset must be non-negative')
    }

    const query = db.prepare(`
      SELECT *, 
      COUNT(*) OVER() as totalCount 
      FROM analytics 
      ORDER BY createdAt DESC
      LIMIT $limit OFFSET $offset;
    `)

    const result = query.all({
      $limit: limit,
      $offset: offset,
    }) as Analytic[]

    return result
  }
}
