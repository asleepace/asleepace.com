import { PATH } from '@/consts'
import { defineMiddleware } from 'astro:middleware'
import chalk from 'chalk'

const TAG = chalk.gray('[m] security\t')

const whitelist = ['/admin/logout', '/admin/login', '/api/proxy']
const blacklist = ['/api', '/admin']

/**
 *  ## securityMiddleware
 *
 *  Redirect GET request on protected routes if user is not logged in.
 *
 *  @note must be called after `sessionMiddleware`
 *
 */
export const securityMiddleware = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next()
  if (context.request.method !== 'GET') return next()
  if (context.locals.isLoggedIn) return next()

  const path = context.url.pathname

  // check if path is whitelisted or blacklisted
  const isWhitelisted = whitelist.some((p) => path.startsWith(p))
  const isBlacklisted = blacklist.some((p) => path.startsWith(p))

  // skip checks for whitelisted paths
  if (isWhitelisted) {
    console.log(TAG, chalk.gray(path), chalk.white(`(whitelisted)`))
    return next()
    // authorized users only
  } else if (isBlacklisted) {
    console.log(TAG, chalk.gray(path), chalk.red(`(blacklisted)`))
    return context.redirect(PATH.ADMIN_LOGIN(), 302)
  } else {
    console.log(TAG, chalk.gray(path), chalk.gray(`(skipping...)`))
    return next()
  }
})
