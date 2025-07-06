import Database from 'bun:sqlite'
import { Users, type User } from '@/db/index.server'

export type UserId = number

export type Session = {
  id: UserId
  userId: number
  token: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export namespace Sessions {
  const TOKEN_BYTES = 32
  const TOKEN_EXPIRATION_DAYS = 30

  let db: Database

  export const SESSIONS_INIT = `
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,        -- Add UNIQUE constraint
      expiresAt DATETIME NOT NULL,       -- Add expiration timestamp
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Add index for faster token lookups
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    
    -- Add index for user sessions
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(userId);
  `

  /**
   * @note this must be called first before any other functions are called.
   */
  export function attachSessionsTable(sharedDatabaseInstance: Database) {
    console.log('[db][sessions] attaching table...')
    db = sharedDatabaseInstance
    db.run(SESSIONS_INIT)
  }

  /**
   * ## adminOnly(sessionCookie)
   *
   * @returns the user if they are an admin or super admin
   * @throws an error if the user is not an admin or super admin
   */
  export function adminOnly(sessionCookie: string | undefined): User | never {
    if (!sessionCookie) throw new Error('No session cookie provided')

    const session = findByToken(sessionCookie)
    if (!session) {
      throw new Error('Session not found for admin only section!')
    }

    const user = Users.getUserById(session.userId)

    if (!user) throw new Error('No user found')

    if (Users.isAdmin(user) || Users.isSuperAdmin(user)) {
      return user
    } else {
      throw new Error('Invalid permissions!')
    }
  }

  /**
   * ## getUser(sessionCookie)
   *
   * @returns the user for the given session cookie
   */
  export async function getUser(sessionCookie: string | undefined): Promise<User | undefined> {
    if (!sessionCookie) return undefined
    const session = findByToken(sessionCookie)
    if (!session) return undefined
    return Users.getUserById(session.userId)
  }

  /**
   * ## isValid(sessionCookie)
   *
   * @returns true if the session cookie is valid and not expired
   *
   * ```
   * // example usage
   * const sessionCookie = Astro.cookies.get('session')
   *
   * const isValid = Sessions.isValid(sessionCookie?.value)
   *
   * if (!isValid) return Astro.redirect('/')
   * ```
   */
  export function isValid(sessionCookie: string | undefined): boolean {
    if (!sessionCookie) return false
    const session = findByToken(sessionCookie)
    return Boolean(session && session.expiresAt > new Date())
  }

  export function getExpiry(): Date {
    return new Date(Date.now() + 1000 * 60 * 60 * 24 * TOKEN_EXPIRATION_DAYS)
  }

  export function generateToken(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(TOKEN_BYTES))
    const token = Buffer.from(bytes).toString('hex')
    return token
  }

  /**
   * attempts to find the user for the given session token, otherwise throws an error.
   * @param sessionToken - the session token to find the user for (Bearer token)
   * @returns the user for the given session token
   */
  export function findUser(sessionToken: string): User | undefined {
    const session = findByToken(sessionToken)
    if (!session) return
    const user = Users.getUserById(session.userId)
    if (!user) {
      console.warn('User not found for session!')
      throw new Error('User not found for session!')
    }
    return user
  }

  export function findByToken(token: string): Session | undefined {
    const session = db.query('SELECT * FROM sessions WHERE token = $token').get({
      $token: token,
    }) as Session | undefined
    return session ?? undefined
  }

  export function create(userId: number): Session | never {
    const token = generateToken()
    const expiresAt = getExpiry()
    const query = db.prepare(`
      INSERT INTO sessions (userId, token, expiresAt)
      VALUES ($userId, $token, $expiresAt)
      RETURNING *;
    `)

    const session = query.get({
      $userId: userId,
      $token: token,
      $expiresAt: expiresAt.toISOString(),
    }) as Session | undefined

    if (!session) {
      console.error('Failed to create session:', session)
      throw new Error('Failed to create session')
    }

    return session
  }
}
