import type { APIRoute } from 'astro'
import { http } from '@/lib/http'
import type { ApiProxyResponse } from './proxy'
import { safeEval } from '@/lib/safeEval'

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
export const GET: APIRoute = async ({ request }) => {
  const { searchParams } = http.parse(request)
  const { uri } = searchParams

  if (!uri) return http.failure(400, 'Missing URI parameter')

  const proxy = http.host('api/proxy', {
    uri: encodeURIComponent(uri),
  })

  const sourceCode = await fetch(proxy)
    .then((res) => res.json() as Promise<ApiProxyResponse>)
    .catch((er) => er as Error)

  if (sourceCode instanceof Error) {
    return http.failure(500, 'Failed to fetch remote code')
  }

  const output = await safeEval(sourceCode.data, {
    ...searchParams, // exec args
  })

  return output instanceof Error
    ? http.failure(500, output.message)
    : http.success({ output, source: uri })
}
