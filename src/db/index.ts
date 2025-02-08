import Database from 'bun:sqlite'
import {
  USERS_INIT,
  SESSIONS_INIT,
  type User,
  type UserSession,
  UserFlags,
  ANALYTICS_INIT,
} from './types'

// --- initialize the database ---

const db = new Database('db.sqlite')

db.run(USERS_INIT)
db.run(SESSIONS_INIT)
db.run(ANALYTICS_INIT)

// --- helper functions ---

export namespace Users {
  /**
   * Check if the user has all of the given flags.
   */
  export const hasFlags = (user: User, ...flags: UserFlags[]) =>
    flags.every((flag) => (user.flags & flag) === flag)

  /**
   * Set the user's flags.
   *
   * TODO: ensure this can only be done by admins/super admins.
   */
  export const setFlags = (user: User, ...flags: UserFlags[]) => {
    const flagAsNumber = flags.reduce((acc, flag) => acc | flag, 0)
    const query = db.prepare(`
      UPDATE users SET flags = $flags WHERE id = $id;
    `)
    return query.run({
      $id: user.id,
      $flags: flagAsNumber,
    }).lastInsertRowid
  }

  /**
   * Check if the user is banned (has banned flag).
   */
  export const isBanned = (user: User) => hasFlags(user, UserFlags.Banned)

  /**
   * Check if the user is an admin (or super admin).
   */
  export const isAdmin = (user: User) =>
    hasFlags(user, UserFlags.Admin) || hasFlags(user, UserFlags.SuperAdmin)

  /**
   * Check if the user is a super admin (highest permission).
   */
  export const isSuperAdmin = (user: User) =>
    user.username === 'asleepace' || hasFlags(user, UserFlags.SuperAdmin)

  /**
   * Verify a password against a hashed password.
   */
  export async function verifyPassword(
    hashedPassword: string,
    rawPassword: string
  ): Promise<boolean> {
    return Bun.password.verify(rawPassword, hashedPassword)
  }

  export async function hashPassword(rawPassword: string): Promise<string> {
    return Bun.password.hash(rawPassword, {
      algorithm: 'bcrypt',
      cost: 10,
    })
  }

  // --- user functions ---

  export function fetchUsers() {
    return db.query('SELECT * FROM users').all()
  }

  export async function createUser({
    email,
    username,
    password,
  }: Pick<User, 'email' | 'username' | 'password'>) {
    const query = db.prepare(`
      INSERT INTO users (email, username, password)
      VALUES ($email, $username, $password)
      RETURNING *;
    `)

    const hash = await hashPassword(password)

    const user = query.get({
      $email: email,
      $username: username,
      $password: hash,
    }) as User | undefined

    if (!user) {
      throw new Error('Failed to create user')
    }

    return user
  }

  export function getUserByEmail(email: string) {
    return db.query('SELECT * FROM users WHERE email = $email').get({
      $email: email,
    }) as User | undefined
  }

  export function getUserByUsername(username: string) {
    return db.query('SELECT * FROM users WHERE username = $username').get({
      $username: username,
    }) as User | undefined
  }

  export function getUserById(id: number) {
    return db.query('SELECT * FROM users WHERE id = $id').get({
      $id: id,
    }) as User | undefined
  }

  export function findUser(
    user: Partial<Pick<User, 'id' | 'email' | 'username'>>
  ) {
    return db
      .query(
        'SELECT * FROM users WHERE id = $id OR email = $email OR username = $username LIMIT 1;'
      )
      .get({
        $id: user.id ?? null,
        $email: user.email ?? null,
        $username: user.username ?? null,
      }) as User | undefined
  }

  // --- initialize the database ---

  try {
    console.log('[db] creating user...')
    // createUser({
    //   email: 'colin_teahan@yahoo.com',
    //   username: 'asleepace',
    //   password: '!Password123',
    // })
    const user = getUserByUsername('asleepace')
    if (!user) throw new Error('User not found')
    setFlags(user, UserFlags.Admin)
  } catch (error) {
    console.error('[db] error creating user:', error)
  } finally {
    console.log('[db] user created:', fetchUsers())
  }
}

// --- session functions ---

export namespace Sessions {
  const TOKEN_BYTES = 32
  const TOKEN_EXPIRATION_DAYS = 30

  /**
   * ## adminOnly(sessionCookie)
   *
   * @returns the user if they are an admin or super admin
   * @throws an error if the user is not an admin or super admin
   */
  export function adminOnly(sessionCookie: string | undefined): User | never {
    if (!sessionCookie) throw new Error('No session cookie provided')

    const session = findByToken(sessionCookie)
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
  export function getUser(sessionCookie: string | undefined): User | undefined {
    if (!sessionCookie) return undefined
    const session = findByToken(sessionCookie)
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
    console.log('[Sessions] session:', session)
    return true
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
  export function findUser(sessionToken: string): User | never {
    const session = findByToken(sessionToken)
    const user = Users.getUserById(session.userId)
    if (!user) {
      console.warn('User not found for session!')
      throw new Error('User not found for session!')
    }
    return user
  }

  export function findByToken(token: string): UserSession | never {
    const session = db
      .query('SELECT * FROM sessions WHERE token = $token')
      .get({
        $token: token,
      }) as UserSession | undefined

    if (!session) {
      throw new Error('Session not found')
    }

    return session
  }

  export function create(userId: number): UserSession | never {
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
    }) as UserSession | undefined

    if (!session) {
      console.error('Failed to create session:', session)
      throw new Error('Failed to create session')
    }

    return session
  }
}

// --- analytics functions ---

export namespace Analytics {
  export type AnalyticsDataInit = {
    path: string
    userAgent?: string | null
    ipAddress?: string | null
    sessionId?: string | null
    referrer?: string | null
  }

  /**
   * ## Analytics.track(data)
   *
   * Track analytics data for a specific page.
   *
   */
  export function track(data: AnalyticsDataInit) {
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

  /**
   * ## fetchAnalytics(limit=100, offset=0)
   *
   * fetches analytics data from the database.
   *
   * @param limit - the number of records to fetch
   * @param offset - the number of records to skip
   * @returns the analytics data
   *
   */
  export function fetchAnalytics(limit: number = 100, offset: number = 0) {
    if (limit < 0 || offset < 0) {
      throw new Error('Limit and offset must be non-negative')
    }

    const query = db.prepare(
      `
      SELECT 
        *,
        COUNT(*) OVER() as totalCcount 
      FROM analytics 
      ORDER BY createdAt DESC
      LIMIT $limit OFFSET $offset;
  `.trim()
    )

    const result = query.run({
      $limit: limit,
      $offset: offset,
    })

    return result
  }
}
