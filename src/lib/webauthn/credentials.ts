import Database from 'bun:sqlite'
import type { User } from '@/db/types'

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

export function attachCredentialsTable(db: Database) {
  // Drop table if needed in development
  // db.run(CREDENTIALS_DROP)

  // Initialize database if it doesn't exist
  console.log('[db][credentials] initializing table!')
  db.run(CREDENTIALS_INIT)

  return {
    /**
     * Register a new WebAuthN credential for a user.
     */
    addCredential(props: { credentialId: string; userId: number; publicKey: string; userHandle: string }): boolean {
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
    },

    /**
     * Find a user by their userHandle.
     */
    getUserByHandle({ userHandle }: { userHandle: string }): User | undefined {
      console.log('[db][credentials] getUserByHandle:', userHandle)
      const query = db.query(`
        SELECT u.* FROM users u INNER JOIN credentials c ON u.id = c.userId 
        WHERE c.userHandle = $userHandle
      `)
      const result = query.get({ $userHandle: userHandle })
      return result as User | undefined
    },

    /**
     * Get a specific credential by ID and user ID.
     */
    getCredentialById({ credentialId }: { credentialId: string }): Credential | undefined {
      const query = db.query(`SELECT * FROM credentials  WHERE id = $credentialId`)
      const result = query.get({ $credentialId: credentialId })
      return result as Credential | undefined
    },

    /**
     * Get all credentials for a specific user.
     */
    getCredentialsForUser({ id }: User): Credential[] {
      const results = db.query(`SELECT * FROM credentials WHERE userId = $id`).all({ $id: id })
      return results as Credential[]
    },

    /**
     * Update the signature counter for a credential.
     */
    updateCredentialCounter({ credentialId, counter }: { credentialId: string; counter: number }): boolean {
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
    },

    /**
     * Delete a specific credential.
     */
    deleteCredential({ credentialId }: { credentialId: string }): boolean {
      const query = db.prepare(`DELETE FROM credentials WHERE id = $credentialId`)
      const result = query.run({ $credentialId: credentialId })
      return Boolean(result.changes > 0)
    },

    /**
     * Delete all credentials for a user.
     */
    deleteAllCredentialsForUser({ userId }: { userId: number }): number {
      const query = db.prepare(`DELETE FROM credentials WHERE userId = $userId`)
      const result = query.run({ $userId: userId })
      return result.changes
    },
  }
}
