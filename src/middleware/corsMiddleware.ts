import { defineMiddleware } from 'astro:middleware'
import chalk from 'chalk'

const TAG = chalk.gray('[m] cors\t')

/**
 *  @deprecated this is not needed, since Astro's CORS config is set to `false`
 *
 *  ## corsMiddleware
 *
 *  NOTE: This should run after everything else!
 *
 *  There might not be needed, since Astro's CORS config is set to `false`
 *
 *  @description appends CORS headers to the response.
 *
 *  @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
 *  @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods
 *  @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers
 *
 */
export const corsMiddleware = defineMiddleware(async (context, next) => {
  if (context.isPrerendered !== true) return next() // skip if

  const response = await next()

  console.log(TAG, chalk.gray(context.url.pathname))

  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, HEAD'
  )

  return new Response(response.body, {
    status: response.status,
    headers,
  })
})
