import { consoleTag } from '@/utils/tagTime'
import { getIpAddressFromHeaders } from '@/lib/backend/ipAddress'
import Database from 'bun:sqlite'
import chalk from 'chalk'
import type { AstroCookies } from 'astro'
import { Cookies } from '@/lib/backend'

const print = consoleTag('db:analytics', chalk.magentaBright)

export type AnalyticsDeviceType = 'mobile' | 'desktop' | 'tablet'

export type AnalyticsData = {
  path: string
  params?: Record<string, string>
  method?: string
  status?: number
  userAgent?: string
  ipAddress?: string
  trackingId?: string
  deviceType?: AnalyticsDeviceType
  country?: string
  isBot?: boolean
  isExternal?: boolean
  message?: string
  headers?: Record<string, string>
}

export namespace Analytics {
  let db: Database

  const ANALYTICS_INIT = `
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      params TEXT, -- JSON string
      method TEXT NOT NULL DEFAULT 'GET',
      status INTEGER NOT NULL DEFAULT 200,
      user_agent TEXT,
      ip_address TEXT,
      tracking_id TEXT,
      device_type TEXT,
      country TEXT,
      is_bot BOOLEAN DEFAULT FALSE,
      is_external BOOLEAN DEFAULT FALSE,
      message TEXT,
      headers TEXT, -- JSON string
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `

  const DROP_TABLE = `
    DROP TABLE IF EXISTS analytics;
  `

  export function attachAnalyticsTable(sharedDatabaseInstance: Database) {
    print('attaching table...')
    db = sharedDatabaseInstance
    migrateAnalyticsTable() // TODO: remove after next release
    db.run(ANALYTICS_INIT)
  }

  /**
   *  Use this to migrate the analytics table to the new schema, currently it will drop the table if
   *  the referrer column exists.
   */
  export function migrateAnalyticsTable() {
    const tableInfo = db.prepare("SELECT name FROM pragma_table_info('analytics') WHERE name = 'referrer'").get()

    if (tableInfo) {
      print('migrating analytics table...')
      dropAnalyticsTable()
    }

    // Create/recreate table with new schema
    db.run(ANALYTICS_INIT)
  }

  export function dropAnalyticsTable() {
    print('dropping table...')
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
      ? `SELECT * FROM analytics WHERE path = $path AND timestamp > datetime('now', '-${safeDays} days') ORDER BY timestamp DESC`
      : `SELECT * FROM analytics WHERE timestamp > datetime('now', '-${safeDays} days') ORDER BY timestamp DESC`
    const stmt = db.prepare(query)
    const rows = path ? stmt.all({ $path: path }) : stmt.all()
    return rows.map(transformResult)
  }

  export function getAllAnalytics(): AnalyticsData[] {
    const stmt = db.prepare(`SELECT * FROM analytics ORDER BY timestamp DESC`)
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
      params: safeDecodeJSON(result.params),
      headers: safeDecodeJSON(result.headers),
    }
  }

  function isExternalRequest(headers: Headers): boolean {
    // Check if request came from external site
    const referer = headers.get('referer') || headers.get('referrer')
    const origin = headers.get('origin')
    const host = headers.get('host')
    if (!referer && !origin) return false
    try {
      const refererHost = referer ? new URL(referer).host : null
      const originHost = origin ? new URL(origin).host : null
      return Boolean((refererHost && refererHost !== host) || (originHost && originHost !== host))
    } catch {
      return false
    }
  }

  function getCountryFromHeaders(headers: Headers): string | undefined {
    const countryHeaders = ['country', 'x-country', 'x-cf-ipcountry', 'x-real-country', 'x-forwarded-country']
    for (const header of countryHeaders) {
      const country = headers.get(header)
      if (country) return country
    }
    return undefined
  }

  // --- track request ---

  export async function insert(data: AnalyticsData) {
    const stmt = db.prepare(`
      INSERT INTO analytics (
        path, params, method, status, user_agent, ip_address, 
        tracking_id, device_type, country, is_bot, is_external,
        message, headers
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    return stmt.run(
      data.path,
      data.params ? safeEncodeJSON(data.params) : null,
      data.method || 'GET',
      data.status || 200,
      data.userAgent || null,
      data.ipAddress || null,
      data.trackingId || null,
      data.deviceType || null,
      data.country || null,
      data.isBot || false,
      data.isExternal || false,
      data.message || null,
      data.headers ? safeEncodeJSON(data.headers) : null
    )
  }

  export function trackEvent(event: {
    request: Request
    cookies: AstroCookies
    response?: Response
    message?: string
    status?: number
  }) {
    try {
      const { request, response } = event
      const url = new URL(request.url)

      const ipAddress = getIpAddressFromHeaders(request.headers) ?? ''
      const headers = Object.fromEntries(request.headers.entries())
      const country = getCountryFromHeaders(request.headers)
      const userAgent = headers['user-agent'] ?? ''
      const deviceType = getDeviceType(userAgent)

      // convert search params to an object
      const params = Object.fromEntries(url.searchParams.entries())

      // get tracking id from cookies (will generate a new one if not present)
      const trackingId = Cookies.getTrackingId(event.cookies)

      // remove headers which are redudant
      delete headers['user-agent']

      return insert({
        path: url.pathname,
        params,
        method: request.method,
        status: event.status ?? response?.status ?? 200,
        userAgent,
        ipAddress,
        trackingId,
        country,
        deviceType,
        isBot: isBot(userAgent),
        isExternal: isExternalRequest(request.headers),
        message: event.message,
        headers,
      })
    } catch (e) {
      print('error:', e)
    }
  }
}
