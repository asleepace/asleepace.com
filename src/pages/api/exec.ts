import type { APIRoute } from 'astro'
import { http } from '@/lib/http'
import type { ApiProxyResponse } from './proxy'

export const prerender = false

/**
 * TypeScript API
 *
 * This page contains the entry point for the typescript application programming interface (API).
 * Request can be handled here or by the Rust backend as well.
 *
 * documentation: https://docs.astro.build/en/guides/endpoints/
 */
export const GET: APIRoute = async ({ request }) => {
  const redirectToProxy = http
    .parse(request)
    .getSearchParam('uri')
    .decodeURIComponent()

  console.log('[api/exec] redirecting to:', redirectToProxy)

  const proxyResponse = await fetch(
    `http://localhost:4321/api/proxy?uri=${encodeURIComponent(redirectToProxy)}`
  ).catch((e) => {
    console.error('[api/exec] failed to fetch:', e)
    return http.failure(500, 'Failed to fetch')
  })

  const proxy: ApiProxyResponse = await proxyResponse.json()
  console.log('[api/exec] response:', proxy)
  const output = await safeEval(proxy.data)
  return http.success({ output, status: proxy.status })
}

async function safeEval(code: string): Promise<unknown | null> {
  try {
    const result = await eval(code)
    return result ?? null
  } catch (e) {
    console.error('[api/exec] failed to evaluate:', e)
    return null
  }
}
