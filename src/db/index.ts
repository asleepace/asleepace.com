import Database from 'bun:sqlite'
import { USERS_INIT, SESSIONS_INIT, type User, type UserSession } from './types'
import type { AstroCookies } from 'astro'

// --- initialize the database ---

const db = new Database('db.sqlite')

db.run(USERS_INIT)
db.run(SESSIONS_INIT)

// --- helper functions ---

export namespace Users {
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
}

// --- session functions ---

export namespace Sessions {
  const TOKEN_BYTES = 32
  const TOKEN_EXPIRATION_DAYS = 30

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
    console.log('[Sessions] validate sessionToken:', sessionCookie)
    const session = findByToken(sessionCookie)
    console.log('[Sessions] found session:', session)
    const isExpired = session.expiresAt > new Date()
    console.log('[Sessions] isExpired:', isExpired)
    return isExpired
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
