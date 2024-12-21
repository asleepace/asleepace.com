import type { APIRoute } from 'astro'
import { http, type HttpStatus } from '@/lib/http'

export const prerender = false

export type ApiProxyResponse = {
  status: number
  contentType: string
  data: string
}

/**
 * GET /api/proxy?uri={uri}
 *
 * This endpoint will decode the URI parameter and fetch the resource, returning
 * the response to the client.
 *
 * @returns {ApiProxyResponse}
 *
 */
export const GET: APIRoute = async ({ request }) => {
  const uri = http.parse(request).getSearchParam('uri').decodeURIComponent()
  console.log('[api/proxy] fetching:', uri)
  const proxyResponse = await fetch(uri)
  const proxyStatus = proxyResponse.status as HttpStatus
  const proxyContentType = proxyResponse.headers.get('content-type')

  if (!proxyResponse.ok) {
    return http.failure(proxyStatus, proxyResponse.statusText)
  }

  return http.success({
    status: proxyStatus,
    contentType: proxyContentType,
    data: await proxyResponse.text(),
  })
}

export const HEAD: APIRoute = async () =>
  http.success({
    route: 'GET /api/proxy?uri={uri}',
    parameters: {
      uri: 'The URI to fetch and return to the client.',
    },
    description:
      'This endpoint will decode the URI parameter and fetch the resource, returning the response to the client.',
    methods: ['GET'],
    responseType: {
      status: 'number',
      contentType: 'string',
      data: 'string',
    },
  })
