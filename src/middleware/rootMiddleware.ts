import { consoleTag } from '@/utils/tagTime'
import { defineMiddleware } from 'astro:middleware'
import chalk from 'chalk'

const handleLog = consoleTag('middleware')

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
    handleLog(
      isSSR
        ? chalk.magenta('[ssr]')
        : isAction
        ? chalk.magenta('[action]')
        : '',
      context.url.pathname
    )
    if (context.isPrerendered) return next()

    // const method = context.request.method
    // const path = context.url.pathname

    // --- pre-processing ---

    const response = await next()

    // TODO: too strict, disabling for now, plus there's nothing to hack anyways XD
    // Object.entries(HEADERS.SECURITY).forEach(([header, value]) => {
    //   response.headers.set(header, value)
    // })

    // --- post-processing ---

    return response
  } catch (e) {
    console.error('', chalk.red(e))

    // TODO: write error to database

    return new Response(e?.message, { status: 500 })
  } finally {
    // TODO: handle any cleanup
    // console.log(chalk.gray(`[m][closed] REQ #${requestId}`))
  }
})
