import Database from 'bun:sqlite'
import { Users, type User } from './usersTable'
import { Sessions, type Session } from './sessionsTable'
import { Analytics, type Analytic } from './analyticsTable'
import { Credentials, type Credential } from './credentialsTable'
import { Metrics, type Metric } from './metricsTable'

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
  type Analytic,
  type Credential,
  type Metric,
}
