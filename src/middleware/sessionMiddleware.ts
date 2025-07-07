import { defineMiddleware } from 'astro:middleware'
import { Sessions } from '@/db/index.server'
import { consoleTag } from '@/utils/tagTime'

const handleLog = consoleTag('session')

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

  const sessionCookie = context.cookies.get('session')
  const cookieString = sessionCookie?.value

  const user = await Sessions.getUser(cookieString).catch((e) => {
    handleLog('bad cookie:', e)
    return undefined
  })

  context.locals.isLoggedIn = Boolean(user)
  context.locals.user = user
  return next()
})
