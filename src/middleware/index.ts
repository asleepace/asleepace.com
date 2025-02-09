import { sequence } from 'astro:middleware'
import { sessionMiddleware } from './sessionMiddleware'
import { analyticsMiddleware } from './analyticsMiddleware'
import { securityMiddleware } from './securityMiddleware'
import { rootMiddleware } from './rootMiddleware'

/**
 *  ## Middleware
 *
 *  Middleware is used to process requests and responses before they are sent to the client.
 *
 *  @note pages which are pre-rendered bypass middleware!
 *
 *  @see https://docs.astro.build/en/guides/middleware/
 *
 *  @see `env.d.ts` for types.
 *
 *    0. Root handler
 *    1. Analytics
 *    2. User session
 *    3. Security checks
 *
 */
export const onRequest = sequence(
  rootMiddleware,
  analyticsMiddleware,
  sessionMiddleware,
  securityMiddleware
)
