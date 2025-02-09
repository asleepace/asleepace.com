import { sequence } from 'astro:middleware'
import { sessionMiddleware } from './sessionMiddleware'
import { analyticsMiddleware } from './analyticsMiddleware'

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
 *    1. Analytics based logging
 *    2. User session
 *    3. Remove redacted info?
 *
 */
export const onRequest = sequence(analyticsMiddleware, sessionMiddleware)
