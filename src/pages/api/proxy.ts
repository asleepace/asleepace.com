import type { APIRoute } from 'astro'
import { http, type HttpStatus } from '@/lib/http'
import { endpoint, Exception } from '.'
import { isResponse, isURL } from '@/lib/is'

class UserAgents {
  static MICROSOFT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  static APPLE =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
}

export const prerender = false

export type ApiProxyResponse = {
  status: number
  contentType: string
  data: string
}

/**
 *
 *  GET /api/proxy?uri={uri}
 *
 *  This endpoint will decode the URI parameter and fetch the resource, returning
 *  the response to the client.
 *
 *  @response {ApiProxyResponse}
 *
 */
export const GET: APIRoute = endpoint(async ({ request }) => {
  const { searchParams } = await http.parse(request)
  const { uri } = searchParams

  Exception.assert(uri, 400, 'Missing URI parameter')
  Exception.assert(isURL(uri), 400, 'Invalid URI parameter')

  const headers = new Headers(request.headers)
  headers.has('user-agent') || headers.set('user-agent', UserAgents.APPLE)
  headers.has('accept') || headers.set('accept', '*/*')
  headers.set('accept-encoding', 'identity') // request no compression

  const response = await fetch(uri, {
    method: 'GET',
    headers,
  }).catch((e) => e as Error)

  Exception.assert(isResponse(response), 500, String(response))

  return response.clone()
})

/**
 *
 *  HEAD /api/proxy
 *
 *  This endpoint will return the API route documentation.
 *
 */
export const HEAD: APIRoute = async () =>
  http.success({
    route: 'GET /api/proxy?uri={uri}',
    parameters: {
      uri: 'The URI to fetch and return to the client.',
    },
    description:
      'This endpoint will decode the URI parameter and fetch the resource, returning the response to the client.',
    methods: ['GET'],
    responseType: 'any',
  })
