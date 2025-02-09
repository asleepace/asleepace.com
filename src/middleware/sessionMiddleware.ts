import { defineMiddleware } from 'astro:middleware'
import { Sessions } from '@/db/index'
import chalk from 'chalk'

const TAG = chalk.gray('[m] session\t')

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

  console.log(
    TAG,
    chalk.gray(context.url.pathname),
    chalk.gray(`(${context.request.method.toLowerCase()})`)
  )

  const sessionCookie = context.cookies.get('session')
  const cookieString = sessionCookie?.value

  const user = await Sessions.getUser(cookieString).catch((e) => {
    console.warn(TAG, chalk.red('BAD_COOKIE:'), sessionCookie, e)
    return undefined
  })

  context.locals.isLoggedIn = Boolean(user)
  context.locals.user = user
  return next()
})
