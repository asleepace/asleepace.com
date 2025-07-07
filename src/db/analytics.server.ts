import { consoleTag } from '@/utils/tagTime'
import { getIpAddressFromHeaders } from '@/lib/backend/ipAddress'
import Database from 'bun:sqlite'
import chalk from 'chalk'

const print = consoleTag('db:analytics', chalk.magentaBright)

export type AnalyticsDeviceType = 'mobile' | 'desktop' | 'tablet'

export type AnalyticsData = {
  path: string
  method?: string
  referrer?: string
  userAgent?: string
  ipAddress?: string
  sessionId?: string
  country?: string
  deviceType?: AnalyticsDeviceType
  isBot?: boolean
  message?: string
  headers?: Record<string, string>
  status?: number
}

export namespace Analytics {
  let db: Database

  const ANALYTICS_INIT = `
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      method TEXT NOT NULL DEFAULT 'GET',
      referrer TEXT,
      user_agent TEXT,
      ip_address TEXT,
      session_id TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      country TEXT,
      device_type TEXT,
      is_bot BOOLEAN DEFAULT FALSE,
      message TEXT,
      headers TEXT, -- JSON string
      status INTEGER NOT NULL DEFAULT 200
    );
  `

  const DROP_TABLE = `
    DROP TABLE IF EXISTS analytics;
  `

  export function attachAnalyticsTable(sharedDatabaseInstance: Database) {
    print('attaching table...')
    db = sharedDatabaseInstance
    // TODO: remove this in next release
    // dropAnalyticsTable(db)
    db.run(ANALYTICS_INIT)
  }

  export function dropAnalyticsTable(sharedDatabaseInstance: Database) {
    print('dropping table...')
    db = sharedDatabaseInstance
    db.run(DROP_TABLE)
  }

  // --- helpers ---

  function getDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
    if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) {
      return /iPad|Tablet/i.test(userAgent) ? 'tablet' : 'mobile'
    }
    return 'desktop'
  }

  function isBot(userAgent: string): boolean {
    return /bot|crawl|spider|scrape/i.test(userAgent)
  }

  // --- operations ---

  export function getAnalytics({ path, days = 30 }: { path?: string; days?: number }) {
    const safeDays = Math.max(1, Math.floor(Math.abs(days || 30)))
    const query = path
      ? `SELECT * FROM analytics WHERE path = $path AND timestamp > datetime('now', '-${safeDays} days')`
      : `SELECT * FROM analytics WHERE timestamp > datetime('now', '-${safeDays} days')`
    const stmt = db.prepare(query)
    const rows = path ? stmt.all({ $path: path }) : stmt.all()
    return rows.map(transformResult)
  }

  export function getAllAnalytics(): AnalyticsData[] {
    const stmt = db.prepare(`SELECT * FROM analytics`)
    return stmt.all().map(transformResult)
  }

  function safeEncodeJSON(data: any) {
    try {
      return JSON.stringify(data)
    } catch (e) {
      return null
    }
  }

  function safeDecodeJSON(data: string) {
    try {
      return JSON.parse(data)
    } catch (e) {
      return null
    }
  }

  function transformResult(result: any): AnalyticsData {
    return {
      ...result,
      headers: safeDecodeJSON(result.headers),
    }
  }

  // --- track request ---

  export async function insert(data: AnalyticsData) {
    const stmt = db.prepare(`
      INSERT INTO analytics (
        path, method, referrer, user_agent, ip_address, 
        session_id, country, device_type, is_bot,
        message, headers, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    return stmt.run(
      data.path,
      data.method || 'GET',
      data.referrer || null,
      data.userAgent || null,
      data.ipAddress || null,
      data.sessionId || null,
      data.country || null,
      data.deviceType || null,
      data.isBot || false,
      data.message || null,
      data.headers ? safeEncodeJSON(data.headers) : null,
      data.status || 200
    )
  }

  export function trackEvent(event: { request: Request; response?: Response; message?: string; status?: number }) {
    try {
      const { request, response } = event
      const { headers } = request
      const url = new URL(request.url)
      return insert({
        path: url.pathname,
        method: request.method,
        referrer: headers.get('referer') ?? '',
        userAgent: headers.get('user-agent') ?? '',
        ipAddress: getIpAddressFromHeaders(headers) ?? '',
        sessionId: headers.get('x-session-id') ?? '',
        country: headers.get('x-country') ?? '',
        deviceType: getDeviceType(headers.get('user-agent') || ''),
        isBot: isBot(headers.get('user-agent') || ''),
        headers: Object.fromEntries(headers.entries()),
        status: event.status ?? response?.status,
        message: event.message,
      })
    } catch (e) {
      print('error:', e)
    }
  }
}
