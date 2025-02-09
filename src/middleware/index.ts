import { sequence } from 'astro:middleware'
import { authMiddleware } from './authMiddleware'
import { analyticsMiddleware } from './analyticsMiddleware'

/**
 * Middleware
 *
 * Middleware is used to process requests and responses before they are sent to the client.
 *
 * documentation: https://docs.astro.build/en/guides/middleware/
 *
 * See the `env.d.ts` file for types.
 *
 * @note pages which are pre-rendered bypass middleware!
 *
 * Process requests and responses before they are sent to the client,
 * all steps are included in the sequence below.
 *
 * documentation: https://docs.astro.build/en/guides/middleware/
 *
 *  1. Analytics based logging
 *  2. Authorization
 *  3. Remove redacted info?
 *
 */
export const onRequest = sequence(analyticsMiddleware, authMiddleware)
