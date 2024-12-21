export type HttpStatus = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500

export type HttpResponseParams = {
  data: any
  status?: HttpStatus
  statusText?: string
  headers?: Record<string, string>
} & ResponseInit

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
}

/**
 * Encode data to JSON, returning null if the encoding fails.
 */
function encodeSafe(data: any): string | null {
  try {
    return JSON.stringify(data)
  } catch (e) {
    console.warn(`Failed to encode body JSON:`, e)
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
  return response({ data, status, statusText })
}

/**
 * Parse incoming request data.
 */
function parse(request: Request) {
  const url = new URL(request.url)
  const searchParams = Object.fromEntries(url.searchParams.entries())
  const headers = Object.fromEntries(request.headers.entries())
  const contentType = headers['content-type'] || 'application/json'
  const body = headers['method'] === 'GET' ? {} : request.json()

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

  return { url, headers, contentType, body, searchParams, getSearchParam }
}

/**
 * GET data from a URL.
 */
function get(uri: string) {
  return fetch(uri, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  })
}
