import Database from 'bun:sqlite'
import type { User } from '@/db/types'

export type Credential = {
  id: string
  userId: number
  publicKey: ArrayBuffer
  counter: number
  userHandle?: string
  createdAt: Date
  updatedAt: Date
}

const CREDENTIALS_INIT = `
  CREATE TABLE IF NOT EXISTS credentials (
      id TEXT PRIMARY KEY,                    -- WebAuthN credential ID
      userId INTEGER NOT NULL,                -- user who owns this credential
      publicKey BLOB NOT NULL,                -- stored public key (as bytes)
      counter INTEGER DEFAULT 0,              -- signature counter
      userHandle TEXT,                        -- optional user handle
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`

export function attachCredentialsTable(db: Database) {
  // Initialize database if it doesn't exist
  db.run(CREDENTIALS_INIT)

  return {
    /**
     * Register a new WebAuthN credential for a user.
     */
    addCredential(props: {
      credentialId: string
      userId: number
      publicKey: ArrayBuffer
      userHandle?: string
    }): boolean {
      try {
        console.log('[credential] adding credential for user:', props.userId)
        const query = db.prepare(`
          INSERT INTO credentials (id, userId, publicKey, userHandle)
          VALUES ($id, $userId, $publicKey, $userHandle);
        `)

        const result = query.run({
          $id: props.credentialId,
          $userId: props.userId,
          $publicKey: new Uint8Array(props.publicKey), // Convert ArrayBuffer to Uint8Array for SQLite
          $userHandle: props.userHandle || null,
        })

        return result.changes > 0
      } catch (error) {
        console.error('[credential] failed to add credential:', error)
        return false
      }
    },

    /**
     * Find a user by their userHandle.
     */
    getUserByHandle({ userHandle }: { userHandle: string }): User | undefined {
      try {
        return db
          .query(
            `
          SELECT u.* 
          FROM users u 
          INNER JOIN credentials c ON u.id = c.userId 
          WHERE c.userHandle = $userHandle
        `
          )
          .get({ $userHandle: userHandle }) as User | undefined
      } catch (error) {
        console.error('[credential] failed to get user by handle:', error)
        return undefined
      }
    },

    /**
     * Get a specific credential by ID and user ID.
     */
    getCredentialById({ credentialId, userId }: { credentialId: string; userId: number }): Credential | undefined {
      try {
        const result = db
          .query(
            `
          SELECT * FROM credentials 
          WHERE id = $credentialId AND userId = $userId
        `
          )
          .get({
            $credentialId: credentialId,
            $userId: userId,
          }) as any

        if (!result) return undefined

        // Convert Uint8Array back to ArrayBuffer
        return {
          ...result,
          publicKey: result.publicKey.buffer.slice(
            result.publicKey.byteOffset,
            result.publicKey.byteOffset + result.publicKey.byteLength
          ),
        } as Credential
      } catch (error) {
        console.error('[credential] failed to get credential:', error)
        return undefined
      }
    },

    /**
     * Get all credentials for a specific user.
     */
    getCredentialsForUser({ id }: User): Credential[] {
      try {
        const results = db.query(`SELECT * FROM credentials WHERE userId = $id`).all({ $id: id }) as any[]

        // Convert Uint8Array back to ArrayBuffer for each result
        return results.map((result) => ({
          ...result,
          publicKey: result.publicKey.buffer.slice(
            result.publicKey.byteOffset,
            result.publicKey.byteOffset + result.publicKey.byteLength
          ),
        })) as Credential[]
      } catch (error) {
        console.error('[credential] failed to get credentials for user:', error)
        return []
      }
    },

    /**
     * Update the signature counter for a credential.
     */
    updateCredentialCounter({ credentialId, counter }: { credentialId: string; counter: number }): boolean {
      try {
        const query = db.prepare(`
          UPDATE credentials 
          SET counter = $counter, updatedAt = CURRENT_TIMESTAMP
          WHERE id = $credentialId
        `)
        const result = query.run({
          $credentialId: credentialId,
          $counter: counter,
        })
        return result.changes > 0
      } catch (error) {
        console.error('[credential] failed to update counter:', error)
        return false
      }
    },

    /**
     * Delete a specific credential.
     */
    deleteCredential({ credentialId }: { credentialId: string }): boolean {
      try {
        const query = db.prepare(`DELETE FROM credentials WHERE id = $credentialId`)
        const result = query.run({ $credentialId: credentialId })
        return result.changes > 0
      } catch (error) {
        console.error('[credential] failed to delete credential:', error)
        return false
      }
    },

    /**
     * Delete all credentials for a user.
     */
    deleteAllCredentialsForUser({ userId }: { userId: number }): number {
      try {
        const query = db.prepare(`DELETE FROM credentials WHERE userId = $userId`)
        const result = query.run({ $userId: userId })
        return result.changes
      } catch (error) {
        console.error('[credential] failed to delete credentials for user:', error)
        return 0
      }
    },
  }
}
