import { defineMiddleware } from 'astro:middleware'
import { Sessions } from '@/db/index.server'
import { consoleTag } from '@/utils/tagTime'
import { Cookies } from '@/lib/backend/cookies'

const print = consoleTag('session')

/**
 *  ## sessionMiddleware
 *
 *  fetch a user from the session cookie and set it to the locals object,
 *  this middleware will run on SSR pages only.
 *
 *  @note does not automatically redirect!
 *
 */
export const sessionMiddleware = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next() // skip pre-renders

  const sessionToken = Cookies.getSessionCookie(context.cookies)

  const user = await Sessions.getUser(sessionToken).catch((e) => {
    Cookies.deleteSessionCookie(context.cookies)
    print('bad cookie:', e)
    return undefined
  })

  context.locals.isLoggedIn = Boolean(user)
  context.locals.user = user
  return next()
})
