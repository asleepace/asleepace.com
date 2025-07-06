import Database from 'bun:sqlite'

export type Metric = {
  path: string
  views: number
  likes: number
  comments: any[] // TODO: add later (json)
  createdAt: Date
  updatedAt: Date
}

export namespace Metrics {
  const INIT_METRICS = `
    CREATE TABLE IF NOT EXISTS metrics (
    path TEXT PRIMARY KEY,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments TEXT DEFAULT '[]', -- JSON array as TEXT
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_metrics_views ON metrics(views);
  CREATE INDEX IF NOT EXISTS idx_metrics_updated ON metrics(updatedAt);
  `

  let db: Database

  export function attachMetricsTable(sharedDatabaseInstance: Database) {
    console.log('[db][metrics] attaching table...')
    db = sharedDatabaseInstance
    db.exec(INIT_METRICS)
  }

  export function getPageMetrics(path: string): Metric {
    const selectQuery = db.prepare(`SELECT * FROM metrics WHERE path = $path`)
    let row = selectQuery.get({ $path: path }) as any

    if (!row) {
      const insertQuery = db.prepare(`
        INSERT INTO metrics (path, views, likes, comments, updatedAt)
        VALUES ($path, 0, 0, '[]', CURRENT_TIMESTAMP)
      `)
      insertQuery.run({ $path: path })
      row = selectQuery.get({ $path: path }) as any
    }

    return {
      ...row,
      comments: JSON.parse(row.comments),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }
  }

  /**
   * @note the values passed to this function will override the current values,
   * otherwise the current values will be used.
   */
  export function upsertPageMetrics(props: { path: string; views?: number; likes?: number; comments?: any[] }) {
    // Get current values only if we need them
    const needsCurrent = props.views === undefined || props.likes === undefined || props.comments === undefined
    const current = needsCurrent ? getPageMetrics(props.path) : undefined

    const query = db.prepare(`
      INSERT INTO metrics (path, views, likes, comments, updatedAt)
      VALUES ($path, $views, $likes, $comments, CURRENT_TIMESTAMP)
      ON CONFLICT(path) DO UPDATE SET
        views = $views,
        likes = $likes,
        comments = $comments,
        updatedAt = CURRENT_TIMESTAMP
    `)

    query.run({
      $path: props.path,
      $views: props.views ?? current?.views ?? 0,
      $likes: props.likes ?? current?.likes ?? 0,
      $comments: JSON.stringify(props.comments ?? current?.comments ?? []),
    })
  }

  export function incrementPageViews(path: string): void {
    const query = db.prepare(`
      INSERT INTO metrics (path, views, updatedAt)
      VALUES ($path, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(path) DO UPDATE SET
        views = views + 1,
        updatedAt = CURRENT_TIMESTAMP
    `)
    query.run({ $path: path })
  }

  export function incrementPageLikes(path: string): void {
    const query = db.prepare(`
      INSERT INTO metrics (path, likes, updatedAt)
      VALUES ($path, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(path) DO UPDATE SET
        likes = likes + 1,
        updatedAt = CURRENT_TIMESTAMP
    `)
    query.run({ $path: path })
  }

  export function addPageComment(path: string, comment: any): void {
    const query = db.prepare(`
      INSERT INTO metrics (path, comments, updatedAt)
      VALUES ($path, json_array(json($comment)), CURRENT_TIMESTAMP)
      ON CONFLICT(path) DO UPDATE SET
        comments = json_insert(comments, '$[#]', json($comment)),
        updatedAt = CURRENT_TIMESTAMP
    `)
    query.run({
      $path: path,
      $comment: JSON.stringify(comment),
    })
  }
}
