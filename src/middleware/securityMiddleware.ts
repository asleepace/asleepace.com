import { PATH } from '@/consts'
import { defineMiddleware } from 'astro:middleware'

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
  '/api/metrics',
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
  if (context.request.method !== 'GET') return next()
  if (context.locals.isLoggedIn) return next()

  const path = context.url.pathname

  // check if path is whitelisted or blacklisted
  const isWhitelisted = whitelist.some((p) => path.startsWith(p))
  const isBlacklisted = blacklist.some((p) => path.startsWith(p))

  // skip checks for whitelisted paths
  if (isWhitelisted || !isBlacklisted) return next()

  console.warn('[middleware][security] unauthorized access:', path)

  // redirect to login page for blacklisted paths
  return context.redirect(PATH.ADMIN_LOGIN(), 302)
})
