import Database from 'bun:sqlite'
import type { User } from './types'

export type Passkey = {
  userId: number
  passkey: string
  createdAt: Date
  updatedAt: Date
}

const PASSKEYS_INIT = `
  CREATE TABLE IF NOT EXISTS passkeys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      passkey TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
`

export function attachPasskeysTable(db: Database) {
  // initialize database if it doesn't exist
  db.run(PASSKEYS_INIT)

  return {
    /**
     *  Register a passkey for a specific user.
     */
    addPasskey(props: { userId: number; passkey: string }) {
      console.log('[passkey] adding passkey:', props)
      const query = db.prepare(`
        INSERT INTO passkeys (userId, passkey)
        VALUES ($userId, $passkey);
      `)

      const result = query.run({
        $userId: props.userId,
        $passkey: props.passkey,
      })
      console.log('[passkey] result:', result)
    },
    /**
     * Find a user based on a provided passkey.
     */
    getUserByHandle({ userHandle }: { userHandle: string }): User | undefined {
      return db
        .query(
          `
            SELECT u.* 
            FROM users u 
            INNER JOIN passkeys p ON u.id = p.userId 
            WHERE p.passkey = $userHandle`
        )
        .get({ $userHandle: userHandle }) as User | undefined
    },
    /**
     *  Get all passkeys for a specific user.
     */
    getPasskeysForUser({ id }: User): Passkey[] {
      return db.query(`SELECT * FROM passkeys WHERE userId = $id`).all({ $id: id }) as Passkey[]
    },
    /**
     *  Delete a specific passkey.
     */
    deletePasskey({ passkey }: Passkey): boolean {
      const query = db.prepare(`DELETE FROM passkeys WHERE passkey = $passkey`)
      const result = query.run({ $passkey: passkey })
      return result.changes > 0
    },
  }
}
