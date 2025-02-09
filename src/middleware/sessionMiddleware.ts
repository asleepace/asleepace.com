import { defineMiddleware } from 'astro:middleware'
import { Sessions } from '@/db/index'

let indentifier = 0

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
  context.locals.isLoggedIn = false
  context.locals.user = undefined

  if (context.isPrerendered) return next() // skip pre-renders

  console.log(
    '[auth][middleware]:',
    context.request.method,
    context.url.pathname
  )
  const sessionCookie = context.cookies.get('session')?.value

  if (!sessionCookie) return next()

  const user = await Sessions.getUser(sessionCookie).catch((e) => {
    console.warn('[authMiddleware] no user for:', sessionCookie, e)
    return undefined
  })

  console.log('[auth] session:', user?.username)
  context.locals.isLoggedIn = Boolean(user)
  context.locals.user = user
  return next()
})
