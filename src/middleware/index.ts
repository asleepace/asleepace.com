import { Sessions } from '@/db'
import { defineMiddleware, sequence } from 'astro:middleware'

/**
 * Middleware
 *
 * Middleware is used to process requests and responses before they are sent to the client.
 *
 * documentation: https://docs.astro.build/en/guides/middleware/
 *
 * See the `env.d.ts` file for types.
 *
 */

const pipeToOutput = <T extends object>(data: T) =>
  fetch('https://consoledump.io/qmtlvfx9', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })

/**
 * Auth Middleware
 *
 * This middleware will run on SSR pages only and will fetch a user from the session cookie,
 * if the user is found, the user data will be set to the locals object.
 *
 */
const authMiddleware = defineMiddleware(async (context, next) => {
  // NOTE: ignore pre-rendered pages!
  if (context.isPrerendered) return next()

  // validate user from session cookie
  const sessionCookie = context.cookies.get('session')
  const user = Sessions.getUser(sessionCookie?.value)

  // set user data to locals
  context.locals.isLoggedIn = Boolean(user)
  context.locals.user = user

  return next()
})

/**
 * ## Middleware
 *
 * Process requests and responses before they are sent to the client,
 * all steps are included in the sequence below.
 *
 * documentation: https://docs.astro.build/en/guides/middleware/
 *
 *  1. Analytics based logging
 *  2. Authorization
 *  3.
 *
 */
export const onRequest = sequence(authMiddleware)
