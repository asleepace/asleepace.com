import { Analytics } from '@/db/'
import { getIpAddressFromHeaders } from '@/lib/server/ipAddress'
import { logError, logMessage } from '@/lib/db/logs'
import { consoleTag } from '@/lib/utils/tagTime'
import { defineMiddleware } from 'astro:middleware'
import chalk from 'chalk'

const print = consoleTag('middleware')

/**
 *  ## Root Middleware
 *
 *  @description first to run, last to respond.
 *
 *  @note this is the last middleware to run, so it can be used to handle any post-processing.
 *
 */
export const rootMiddleware = defineMiddleware(async (context, next) => {
  try {
    if (context.isPrerendered) return next()

    // --- handle tracking ---
    if (import.meta.env.PROD) {
      const ipAddress = getIpAddressFromHeaders(context.request.headers)
      if (ipAddress !== 'localhost' && ipAddress !== '') {
        const pathName = context.url.pathname
        const method = context.request.method
        logMessage(`${method} ${pathName} ${ipAddress}`)
      }
    }

    // --- pre-processing ---

    const response = await next()

    Analytics.trackEvent({
      request: context.request,
      cookies: context.cookies,
      response,
      message: 'default',
    })

    // --- post-processing ---

    return response
  } catch (e) {
    logError(e, 'rootMiddleware')
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    console.warn('[middleware] caught:', message)

    Analytics.trackEvent({
      request: context.request,
      cookies: context.cookies,
      status: 500,
      message,
    })

    return new Response(message, { status: 500 })
  }
})
