import { PATH } from '@/consts'
import { consoleTag } from '@/utils/tagTime'
import { defineMiddleware } from 'astro:middleware'
import chalk from 'chalk'

const whitelist = [
  '/admin/logout',
  '/admin/login',
  '/admin/panel',
  '/api/proxy',
  '/api/analytics',
  '/api/webauthn/login-start',
  '/api/webauthn/login-complete',
  '/api/webauthn/register-start',
  '/api/webauthn/register-complete',
]
const blacklist = ['/api', '/admin']

const handleLog = consoleTag('security', chalk.yellow)

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
    return next()
    // authorized users only
  } else if (isBlacklisted) {
    handleLog('unauthorized access to blacklisted path:', path)
    return context.redirect(PATH.ADMIN_LOGIN(), 302)
  } else {
    return next()
  }
})
