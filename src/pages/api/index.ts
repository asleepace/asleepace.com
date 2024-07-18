import type { APIRoute } from 'astro'

/**
 * TypeScript API
 *
 * This page contains the entry point for the typescript application programming interface (API).
 * Request can be handled here or by the Rust backend as well.
 *
 * documentation: https://docs.astro.build/en/guides/endpoints/
 */
export const GET: APIRoute = async ({ params, request }) => {
  console.log('[api] params:', params)
  console.log('[api] request:', request)
  return new Response(
    JSON.stringify({
      name: 'Astro',
      url: 'https://astro.build/',
    })
  )
}

