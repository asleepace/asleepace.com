export function isURL(url: string | URL): boolean {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

export function isResponse(response: unknown): response is Response {
  return response instanceof Response
}

export function isError(error: unknown): error is Error {
  return error instanceof Error
}

export function isNonNull<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function is<T>(value: unknown, type: string): value is T {
  return typeof value === type
}

export default {
  isURL,
  isResponse,
  isError,
  isNonNull,
  isString,
  is,
}
