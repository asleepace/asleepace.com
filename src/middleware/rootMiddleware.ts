import { HEADERS } from '@/lib/web/WebResponse'
import { defineMiddleware } from 'astro:middleware'
import chalk from 'chalk'

let numberOfRequests = 0

const TAG = (id: number) => chalk.gray(`[m]` + chalk.magenta(` REQ #${id}\t`))

/**
 *  ## Root Middleware
 *
 *  @description first to run, last to respond.
 *
 *  @note this is the last middleware to run, so it can be used to handle any post-processing.
 *
 */
export const rootMiddleware = defineMiddleware(async (context, next) => {
  let requestId = numberOfRequests++
  let requestTag = TAG(requestId)
  try {
    if (context.isPrerendered) return next()

    context.locals.requestId = requestId

    const method = context.request.method
    const path = context.url.pathname

    console.log('\n')
    console.log(requestTag, chalk.gray(method), chalk.cyan(path))

    // --- pre-processing ---

    const response = await next()

    console.log(requestTag, chalk.gray('setting headers'))

    // --- add security headers to all responses ---

    Object.entries(HEADERS.SECURITY).forEach(([header, value]) => {
      response.headers.set(header, value)
    })

    // --- post-processing ---

    return response
  } catch (e) {
    console.error(requestTag, chalk.red(e))

    // TODO: write error to database

    return new Response(e?.message, { status: 500 })
  } finally {
    // TODO: handle any cleanup

    console.log(chalk.gray(`[m][closed] REQ #${requestId}`))
  }
})
