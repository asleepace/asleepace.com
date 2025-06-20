import Database from 'bun:sqlite'
import type { User } from './types'

export type Passkey = {
  userId: number
  passkey: string
  createdAt: Date
  updatedAt: Date
}

export function attachPasskeysTable(db: Database) {
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
    getUserByPasskey({ passkey }: { passkey: string }): User | undefined {
      try {
        // Single query with JOIN for efficiency
        const result = db
          .query(
            `
          SELECT u.* 
          FROM users u 
          INNER JOIN passkeys p ON u.id = p.userId 
          WHERE p.passkey = $passkey
        `
          )
          .get({ $passkey: passkey }) as User | undefined

        if (!result) {
          console.warn('[passkey] no user found for provided passkey')
        }

        return result
      } catch (error) {
        console.error('[passkey] failed to get user by passkey:', error)
        return undefined
      }
    },
    /**
     *  Get all passkeys for a specific user.
     */
    getPasskeysForUser({ id }: User) {
      return db.query(`SELECT * FROM passkeys WHERE userId = $id`).all({ $id: id }) as Passkey[]
    },
  }
}
