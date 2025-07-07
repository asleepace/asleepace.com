import { Analytics } from '@/db/analytics.server'
import { consoleTag } from '@/utils/tagTime'
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
    const isSSR = context.isPrerendered
    const isAction = context.url.pathname.startsWith('/_actions/')
    print(isSSR ? chalk.magenta('[ssr]') : isAction ? chalk.magenta('[action]') : '', context.url.pathname)
    if (context.isPrerendered) return next()

    // --- pre-processing ---

    const response = await next()

    Analytics.trackEvent({
      request: context.request,
      response,
      message: 'default',
    })

    // --- post-processing ---

    return response
  } catch (e) {
    const message = e instanceof Error ? e.message : 'error'

    print(chalk.redBright('error:'), e?.message ?? e)

    Analytics.trackEvent({
      request: context.request,
      message,
    })

    return new Response(e?.message, { status: 500 })
  } finally {
    // TODO: handle any cleanup
  }
})
