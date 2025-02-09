import { siteConfig } from "@/consts"

// ================================================
// Types
// ================================================

export type HttpStatus = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500 | number

export type HttpResponseParams = {
  data: any
  status?: HttpStatus
  statusText?: string
  headers?: Record<string, string>
} & ResponseInit

// ================================================
// Module
// ================================================

/**
 * @module http - this module provides a set of utilities for creating HTTP responses,
 * which are returned by the API routes.
 *
 */
export const http = {
  success,
  failure,
  response,
  parse,
  get,
  host,
}

// ================================================
// Helpers
// ================================================

function host(path: string, searchParams?: Record<string, any>): URL {
  const url = new URL(path, siteConfig.baseUrl)
  if (searchParams) {
    url.search = new URLSearchParams(searchParams).toString()
  }
  return url
}

/**
 * Encode data to JSON, returning null if the encoding fails.t
 */
function encodeSafe<T extends object>(data: T): string | null {
  try {
    return JSON.stringify(data)
  } catch (e) {
    console.warn('[http] failed to encode JSON:', e)
    return null
  }
}

/**
 * Create a new HTTP response which returns JSON data, this should be called by
 * all other http response functions.
 *
 * @param data - The response data (to be encoded to JSON).
 * @param status - The HTTP status code.
 * @param statusText - The HTTP status text.
 */
function response({
  data,
  status = 200,
  statusText = 'OK',
  headers = {},
}: HttpResponseParams) {
  return new Response(encodeSafe(data), {
    status,
    statusText,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}

/**
 * Create a new successful HTTP response which returns JSON data.
 */
function success(data: any) {
  return response({ data, status: 200, statusText: 'OK' })
}

/**
 * Create a failure HTTP response which returns JSON data.
 */
function failure(
  status: HttpStatus = 500,
  statusText = 'Internal Server Error',
  data: any = {
    error: statusText,
    code: status,
  }
) {
  console.warn('[http] failure:', data)
  return response({ data, status, statusText })
}

/**
 * Parse incoming request data.
 */
async function parse(request: Request) {
  const url = new URL(request.url)
  const searchParams = Object.fromEntries(url.searchParams.entries())
  const headers = Object.fromEntries(request.headers.entries())
  const contentType = request.headers.get('content-type')
  const contentLength = Number(request.headers.get('content-length'))

  const authorization = headers['Authorization'] || headers['authorization']
  const [authType, oauthToken] = authorization?.split(' ') || []

  const body = request.body && contentLength ? request.body : null

  const getSearchParam = (key: string) => {
    const value = searchParams[key]
    return {
      decodeURIComponent: () => decodeURIComponent(value),
      unwrap: (): string | never => {
        if (!value) {
          throw new Error(`Missing required search param: ${key}`)
        }
        return value
      },
    }
  }

  return {
    url,
    headers,
    contentType,
    body,
    searchParams,
    getSearchParam,
    oauthToken,
    authType,
  }
}

/**
 * GET data from a URL.
 */
function get(uri: string) {
  return fetch(uri, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
}
