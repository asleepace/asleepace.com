import Database from 'bun:sqlite'
import { consoleTag } from '@/utils/tagTime'
import chalk from 'chalk'

const print = consoleTag('db:users', chalk.magentaBright)

export type User = {
  id: number
  email: string
  flags: Users.Flags
  username: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export namespace Users {
  export enum Flags {
    None = 0,
    Admin = 1 << 1,
    SuperAdmin = 1 << 2,
    Banned = 1 << 3,
    Deleted = 1 << 4,
    Suspended = 1 << 5,
    EmailVerified = 1 << 6,
  }

  let db: Database

  const USERS_INIT = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      flags INTEGER NOT NULL DEFAULT 0,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );`

  /**
   * @note this must be called first before any other functions are called.
   */
  export function attachUsersTable(sharedDatabaseInstance: Database) {
    try {
      print('attaching table...')
      db = sharedDatabaseInstance
      db.run(USERS_INIT)
      const allUsers = fetchUsers()
      const numberOfUsers = allUsers.length
      print('total users:', allUsers.length)
      console.assert(numberOfUsers > 0, 'ASSERT_USERS_EXISTS')
    } catch (e) {
      print('error:', e)
    }
  }

  export const hasFlags = (user: User, ...flags: Flags[]): boolean => {
    return flags.every((flag) => (user.flags & flag) === flag)
  }

  /**
   * Set the user's flags.
   *
   * TODO: ensure this can only be done by admins/super admins.
   */
  export const setFlags = (user: User, ...flags: Flags[]) => {
    const flagAsNumber = flags.reduce((acc, flag) => acc | flag, 0)
    const query = db.prepare(`
      UPDATE users SET flags = $flags WHERE id = $id;
    `)
    return query.run({
      $id: user.id,
      $flags: flagAsNumber,
    }).lastInsertRowid
  }

  export const isBanned = (user: User) => hasFlags(user, Flags.Banned)

  export const isAdmin = (user: User) => hasFlags(user, Flags.Admin) || hasFlags(user, Flags.SuperAdmin)

  export const isSuperAdmin = (user: User) => user.username === 'asleepace' || hasFlags(user, Flags.SuperAdmin)

  // --- password functions ---

  export async function verifyPassword(hashedPassword: string, rawPassword: string): Promise<boolean> {
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

  export async function createUser({ email, username, password }: Pick<User, 'email' | 'username' | 'password'>) {
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

  export function findUser(user: Partial<Pick<User, 'id' | 'email' | 'username'>>) {
    return db.query('SELECT * FROM users WHERE id = $id OR email = $email OR username = $username LIMIT 1;').get({
      $id: user.id ?? null,
      $email: user.email ?? null,
      $username: user.username ?? null,
    }) as User | undefined
  }
}
