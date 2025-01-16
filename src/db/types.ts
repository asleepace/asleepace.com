export type User = {
  id: number
  email: string
  flags: UserFlags
  username: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export enum UserFlags {
  None = 0,
  Admin = 1 << 1,
  SuperAdmin = 1 << 2,
  Banned = 1 << 3,
  Deleted = 1 << 4,
  Suspended = 1 << 5,
  EmailVerified = 1 << 6,
}

export const USERS_INIT = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    flags INTEGER NOT NULL DEFAULT 0,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );`

export type UserSession = {
  id: number
  userId: number
  token: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

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
