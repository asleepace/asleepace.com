import Database from 'bun:sqlite'
import type { User } from '@/db/'

/**
 * @note this is just a string alias.
 */
export type Base64String = string

export type Credential = {
  id: string
  userId: number
  publicKey: Base64String
  counter: number
  userHandle: string
  createdAt: Date
  updatedAt: Date
}

export namespace Credentials {
  let db: Database

  // --- use this to reset the table ---
  const CREDENTIALS_DROP = `DROP TABLE IF EXISTS credentials;`

  const CREDENTIALS_INIT = `
    CREATE TABLE IF NOT EXISTS credentials (
        id TEXT PRIMARY KEY,                    -- WebAuthN credential ID
        userId INTEGER NOT NULL,                -- user who owns this credential
        publicKey TEXT NOT NULL,                -- stored public key (as base64)
        counter INTEGER DEFAULT 0,              -- signature counter
        userHandle TEXT NOT NULL,               -- user handle (non-PII userId)
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,

        UNIQUE(userHandle)                      -- Each userHandle should be unique
    );
  `

  export function attachCredentialsTable(sharedDatabaseInstance: Database) {
    console.log('[db][credentials] attaching table...')
    db = sharedDatabaseInstance
    db.run(CREDENTIALS_INIT)
  }

  export function dropTable() {
    console.log('[db][credentials] dropping table...')
    db.run(CREDENTIALS_DROP)
  }

  /**
   * Register a new WebAuthN credential for a user.
   */
  export function addCredential(props: {
    credentialId: string
    userId: number
    publicKey: string
    userHandle: string
  }): boolean {
    console.log('[db][credentials] adding credential:', props)
    const query = db.prepare(`
      INSERT INTO credentials (id, userId, publicKey, userHandle)
      VALUES ($id, $userId, $publicKey, $userHandle);
    `)

    const result = query.run({
      $id: props.credentialId,
      $userId: props.userId,
      $publicKey: props.publicKey,
      $userHandle: props.userHandle,
    })

    return Boolean(result.changes > 0)
  }

  export function getUserByHandle({ userHandle }: { userHandle: string }): User | undefined {
    console.log('[db][credentials] getUserByHandle:', userHandle)
    const query = db.query(`
      SELECT u.* FROM users u INNER JOIN credentials c ON u.id = c.userId 
      WHERE c.userHandle = $userHandle
    `)
    const result = query.get({ $userHandle: userHandle })
    return result as User | undefined
  }

  export function getCredentialById({ credentialId }: { credentialId: string }): Credential | undefined {
    const query = db.query(`SELECT * FROM credentials  WHERE id = $credentialId`)
    const result = query.get({ $credentialId: credentialId })
    return result as Credential | undefined
  }

  export function getCredentialsForUser({ id }: User): Credential[] {
    const results = db.query(`SELECT * FROM credentials WHERE userId = $id`).all({ $id: id })
    return results as Credential[]
  }

  /**
   *  @note TouchID does not increment the counter (this is rarely used)
   */
  export function updateCredentialCounter({
    credentialId,
    counter,
  }: {
    credentialId: string
    counter: number
  }): boolean {
    const query = db.prepare(`
      UPDATE credentials 
      SET counter = $counter, updatedAt = CURRENT_TIMESTAMP
      WHERE id = $credentialId
    `)
    const result = query.run({
      $credentialId: credentialId,
      $counter: counter,
    })
    return Boolean(result.changes > 0)
  }

  export function deleteCredential({ credentialId }: { credentialId: string }): boolean {
    const query = db.prepare(`DELETE FROM credentials WHERE id = $credentialId`)
    const result = query.run({ $credentialId: credentialId })
    return Boolean(result.changes > 0)
  }

  export function deleteAllCredentialsForUser({ userId }: { userId: number }): number {
    const query = db.prepare(`DELETE FROM credentials WHERE userId = $userId`)
    const result = query.run({ $userId: userId })
    return result.changes
  }
}
