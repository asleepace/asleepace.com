import type { APIRoute } from 'astro'
import { http } from '@/lib/http'

export const prerender = false;

export class Exception extends Error {
  /**
   *  Create a new Exception from an unknown error.
   */
  static from(e: unknown, message?: string): Exception {
    return new Exception(e, message)
  }

  /**
   *  Throw an exception if the condition is not true.
   */
  static assert<T>(
    condition: T,
    code: number,
    message?: string
  ): asserts condition {
    if (!Boolean(condition)) throw new Exception(code, message)
  }

  static throw(code: number, message: string): never {
    throw new Exception(code, message)
  }

  static isError(error: unknown): error is Error {
    return error instanceof Exception || error instanceof Error
  }

  static CODES: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
  }

  public code: number = 500
  public text: string = 'Internal Server Error'

  constructor(error: unknown, message?: string) {
    // handle missing error
    if (!error) {
      super('Internal Server Error')

      // handle thrown server errors
    } else if (error instanceof Exception) {
      super(error?.message || 'Internal Server Error')

      // handle proper initialization errors
    } else if (typeof error === 'number' && message) {
      super(message)
      this.code = error

      // handle thrown errors
    } else if (error instanceof Error) {
      super(error.message)

      // handle string errors
    } else if (typeof error === 'string') {
      super(error)

      // handle number errors
    } else if (typeof error === 'number') {
      super(Exception.CODES[error] || 'Internal Server Error')
      this.code = error || 500

      // handle unknown errors
    } else {
      super(String(error) || 'Internal Server Error')
    }
  }
}

export function endpoint(route: APIRoute): APIRoute {
  // perform any extra validation or setup here
  // const cache = new Map<string, any>()

  // wrap the endpoint in a try/catch block

  return async (ctx) => {
    try {
      const result = route(ctx)
      if (result instanceof Promise) {
        return await result
      } else {
        return result
      }
    } catch (e) {
      console.error(`[api/index] error ${ctx.request.url}:`, e)
      const error = new Exception(e)
      return http.failure(error.code, error.text)
    }
  }
}

export const GET: APIRoute = endpoint(() => {
  return http.success({ status: 'online' })
})
