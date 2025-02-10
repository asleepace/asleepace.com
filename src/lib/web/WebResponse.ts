/**
 * Content Security Directives
 */
const CONTENT_SECURITY_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts and eval
  "style-src 'self' 'unsafe-inline'", // Allow inline styles
  "img-src 'self' data: https:", // Allow images from HTTPS sources and data URIs
  "font-src 'self' data:", // Allow fonts from self and data URIs
  "connect-src 'self' https:", // Allow connections to HTTPS sources
  "object-src 'none'", // Block <object>, <embed>, and <applet>
  "frame-ancestors 'self'", // Only allow framing by same origin
  "base-uri 'self'", // Restrict <base> tag
  "form-action 'self'", // Restrict form submissions to same origin
]

/**
 * Permissions Policy Directives
 */
const PERMISSIONS =
  'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'

/**
 * ## HEADERS
 *
 * The headers for the response, these are frozen to prevent mutation.
 */
export const HEADERS = Object.freeze({
  SECURITY: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    // 'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Content-Security-Policy': CONTENT_SECURITY_DIRECTIVES.join('; '),
    // 'Content-Security-Policy': "default-src 'self'",
    'Referrer-Policy': 'no-referrer-when-downgrade',
    'Permissions-Policy': PERMISSIONS,
  },
  API: {
    'Access-Control-Allow-Methods': 'HEAD, GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  WEB: {
    'Content-Type': 'text/html',
  },
  CORS: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'HEAD, GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
  get DEFAULT() {
    return { ...this.SECURITY, ...this.API, ...this.CORS }
  },
} as const)

/**
 * ## ErrorOptions
 *
 * The options for the error message, the error string should be a code
 * which will also be sent as the statusText.
 *
 */
type ErrorOptions = {
  message?: string
  error?: `ERR_${string}`
  status?: number
}

/**
 * ## WebResponse
 *
 * This class extends the native `Response` class to provide additional
 * functionality for web responses.
 *
 * The constructor behaves like the normal response, but will set default
 * headers if not provided.
 */
export class WebResponse extends Response {
  /**
   * Common responses
   */
  static NOT_FOUND(message: string = 'Not Found') {
    return WebResponse.ERR({
      error: 'ERR_NOT_FOUND',
      status: 404,
      message,
    })
  }

  static NOT_AUTHORIZED(message: string = 'Not Authorized') {
    return WebResponse.ERR({
      error: 'ERR_NOT_AUTHORIZED',
      status: 401,
      message,
    })
  }

  static FORBIDDEN(message: string = 'Forbidden') {
    return WebResponse.ERR({
      error: 'ERR_FORBIDDEN',
      status: 403,
      message,
    })
  }

  static BAD_REQUEST(message: string = 'Bad Request') {
    return WebResponse.ERR({
      error: 'ERR_BAD_REQUEST',
      status: 400,
      message,
    })
  }

  /**
   * Returns a 200 response with the given body, if the body is a string it will
   * be converted to an object with a `message` property. If the body is an object
   * it will be converted to a JSON string.
   */
  static OK(body: object = { message: 'OK' }) {
    return new WebResponse(body, {
      statusText: 'OK',
      status: 200,
    }).toJson()
  }

  /**
   * Returns a 4xx-5xx response with the given error options, the response will
   * be a JSON object with an `error` property and a `message` property.
   */
  static ERR(options: ErrorOptions) {
    const error = options.error ?? 'ERR_UNKNOWN'
    const message = options.message ?? 'An unknown error occurred'
    const body = {
      error,
      message,
    }
    return new WebResponse(body, {
      statusText: error,
      status: options.status ?? 500,
    }).toJson()
  }

  /**
   * Static utility methods
   */

  static redirect(url: string, status = 302): WebResponse {
    return new WebResponse(null, {
      status,
      headers: { Location: url },
    })
  }

  static stream(stream: ReadableStream): WebResponse {
    return new WebResponse(stream, {
      headers: { 'Content-Type': 'application/octet-stream' },
    })
  }

  /**
   * Instance methods & properties
   */

  private options: ResponseInit

  constructor(body: any, { headers = {}, ...options }: ResponseInit = {}) {
    super(body, { ...options, headers: { ...HEADERS.DEFAULT, ...headers } })
    this.options = options ?? {}
  }

  clone(): WebResponse {
    return new WebResponse(this.body, this.options)
  }

  withHeaders(headers: HeadersInit): WebResponse {
    const copy = this.clone()
    const next = new Headers(headers)
    next.forEach((value, key) => {
      copy.headers.set(key, value)
    })
    return copy
  }

  withStatus(status: number, statusText?: string): WebResponse {
    return new WebResponse(this.body, {
      ...this.options,
      status,
      statusText: statusText ?? this.statusText,
    })
  }

  withBody(body: any): WebResponse {
    return new WebResponse(body, this.options)
  }

  withCors(): WebResponse {
    return this.clone().withHeaders(HEADERS.CORS)
  }

  /**
   * Calling this will return a clone of the response with the body
   * converted to a JSON object (if it is not already a JSON object),
   * and the content type set to `application/json`.
   */
  toJson(): WebResponse {
    return this.clone()
      .withHeaders({
        'Content-Type': 'application/json',
      })
      .withBody(
        typeof this.body === 'string' ? JSON.parse(this.body) : this.body
      )
  }
}
