import { defineMiddleware } from 'astro:middleware'
import { Sessions } from '@/db/index'

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
  console.log(
    '[middleware] auth:',
    context.request.method,
    context.url.pathname
  )

  if (context.isPrerendered) return next() // skip pre-renders

  const sessionCookie = context.cookies.get('session')
  const cookieString = sessionCookie?.value

  const user = await Sessions.getUser(cookieString).catch((e) => {
    console.warn('[authMiddleware] BAD_COOKIE:', sessionCookie, e)
    return undefined
  })

  console.log('[middleware] SETTING_SESSION:', user?.username)
  context.locals.isLoggedIn = Boolean(user)
  context.locals.user = user
  return next()
})
