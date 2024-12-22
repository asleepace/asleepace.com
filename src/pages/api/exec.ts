import type { APIRoute } from 'astro'
import { http } from '@/lib/http'
import type { ApiProxyResponse } from './proxy'
import { safeEval } from '@/lib/safeEval'
import { Exception } from '.'
import { endpoint } from './index'

export const prerender = false

/**
 *
 *  GET /api/exec?uri={uri}
 *
 *  Fetches JavaScript code from a remote URI and evaluates it in a safe context,
 *  returning the result to the client. The search parameters will be passed to the
 *  code as an object.
 *
 *  e.g. https://raw.githubusercontent.com/asleepace/snips/refs/heads/main/index.js
 *
 */
export const GET: APIRoute = endpoint(async ({ request }) => {
  const { searchParams } = await http.parse(request)
  const { uri } = searchParams

  Exception.assert(uri, 400, 'Missing URI parameter')

  const proxy = http.host('api/proxy', {
    uri,
  })

  // fetch remote code via the proxy endpoint

  const source = await fetch(proxy)
    .then(async (res) => ({
      code: await res.text(),
      status: res.status,
      headers: Object.fromEntries(res.headers),
    }))
    .catch((er) => er as Error)

  const isSourceValid = source instanceof Error === false

  Exception.assert(isSourceValid, 500, 'Failed to fetch remote code')

  const output = await safeEval(source.code, {
    ...searchParams, // exec args
  })

  return output instanceof Error
    ? http.failure(500, output.message)
    : http.success({ output, source: uri })
})
