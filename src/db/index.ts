import Database from 'bun:sqlite'
import { Users, type User } from './users.server'
import { Sessions, type Session } from './sessions.server'
import { Analytics, type AnalyticsData } from './analytics.server'
import { Credentials, type Credential } from './credentials.server'
import { Metrics, type Metric } from './metrics.server'

// --- initialize the database ---

const db = new Database('db.sqlite')

Users.attachUsersTable(db)
Sessions.attachSessionsTable(db)
Analytics.attachAnalyticsTable(db)
Credentials.attachCredentialsTable(db)
Metrics.attachMetricsTable(db)

// --- attach plugins ---

export {
  Users,
  Sessions,
  Analytics,
  Credentials,
  Metrics,
  type User,
  type Session,
  type AnalyticsData,
  type Credential,
  type Metric,
}
