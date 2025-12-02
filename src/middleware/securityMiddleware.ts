import { Responses } from '@/lib/backend'
import { consoleTag } from '@/lib/utils/tagTime'
import { defineMiddleware } from 'astro:middleware'
import chalk from 'chalk'

const print = consoleTag('security', chalk.redBright)

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
  '/api/webauthn/challenge',
  '/api/stocks/',
  '/api/status',
  '/api/metrics',
  '/_actions/',
]

/**
 *  Requires authentication.
 */
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
  if (context.locals.isLoggedIn) return next()
  if (context.request.method !== 'GET') return next()

  const path = context.url.pathname

  // check if path is whitelisted or blacklisted
  const isWhitelisted = whitelist.some((p) => path.startsWith(p))
  const isBlacklisted = blacklist.some((p) => path.startsWith(p))

  // skip checks for whitelisted paths
  if (isWhitelisted) return next()

  // if not whitelisted, but on the blacklist, log the unauthorized access
  if (isBlacklisted) {
    print('unauthorized:', chalk.cyanBright(path), context.request.headers)
    return Responses.NOT_AUTHORIZED()
  }

  // otherwise continue as normal
  return next()
})
