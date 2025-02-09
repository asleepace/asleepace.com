import { defineMiddleware } from 'astro:middleware'
import chalk from 'chalk'

const TAG = chalk.gray('[m] cors\t')

/**
 * ## corsMiddleware
 *
 * NOTE: This should run after everything else!
 *
 * @description
 *  Appends CORS headers to the response.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers
 */
export const corsMiddleware = defineMiddleware(async (context, next) => {
  const response = await next()
  console.log(TAG, chalk.gray(context.url.pathname))
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, HEAD'
  )
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
})
