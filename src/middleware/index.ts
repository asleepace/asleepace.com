import { sequence } from 'astro:middleware'
import { sessionMiddleware } from './sessionMiddleware'
import { analyticsMiddleware } from './analyticsMiddleware'
import { corsMiddleware } from './corsMiddleware'
import { securityMiddleware } from './securityMiddleware'
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
 *    1. Analytics
 *    2. User session
 *    3. Security checks
 *    4. CORS
 *
 */
export const onRequest = sequence(
  analyticsMiddleware,
  sessionMiddleware,
  securityMiddleware,
  corsMiddleware
)
