import '../../chunks/consts_By69ZWqL.mjs';
export { renderers } from '../../renderers.mjs';

const HEADERS = Object.freeze({
  API: {
    "Access-Control-Allow-Methods": "HEAD, GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  WEB: {
    "Content-Type": "text/html"
  },
  CORS: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "HEAD, GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  },
  get DEFAULT() {
    return { ...this.API, ...this.CORS };
  }
});
class WebResponse extends Response {
  /**
   * Common responses
   */
  static NOT_FOUND(message = "Not Found") {
    return WebResponse.ERR({
      error: "ERR_NOT_FOUND",
      status: 404,
      message
    });
  }
  static NOT_AUTHORIZED(message = "Not Authorized") {
    return WebResponse.ERR({
      error: "ERR_NOT_AUTHORIZED",
      status: 401,
      message
    });
  }
  static FORBIDDEN(message = "Forbidden") {
    return WebResponse.ERR({
      error: "ERR_FORBIDDEN",
      status: 403,
      message
    });
  }
  static BAD_REQUEST(message = "Bad Request") {
    return WebResponse.ERR({
      error: "ERR_BAD_REQUEST",
      status: 400,
      message
    });
  }
  /**
   * Returns a 200 response with the given body, if the body is a string it will
   * be converted to an object with a `message` property. If the body is an object
   * it will be converted to a JSON string.
   */
  static OK(body = { message: "OK" }) {
    return new WebResponse(body, {
      statusText: "OK",
      status: 200
    }).toJson();
  }
  /**
   * Returns a 4xx-5xx response with the given error options, the response will
   * be a JSON object with an `error` property and a `message` property.
   */
  static ERR(options) {
    const error = options.error ?? "ERR_UNKNOWN";
    const message = options.message ?? "An unknown error occurred";
    const body = {
      error,
      message
    };
    return new WebResponse(body, {
      statusText: error,
      status: options.status ?? 500
    }).toJson();
  }
  /**
   * Static utility methods
   */
  static redirect(url, status = 302) {
    return new WebResponse(null, {
      status,
      headers: { Location: url }
    });
  }
  static stream(stream) {
    return new WebResponse(stream, {
      headers: { "Content-Type": "application/octet-stream" }
    });
  }
  /**
   * Instance methods & properties
   */
  options;
  constructor(body, { headers = {}, ...options } = {}) {
    super(body, { ...options, headers: { ...HEADERS.DEFAULT, ...headers } });
    this.options = options ?? {};
  }
  clone() {
    return new WebResponse(this.body, this.options);
  }
  withHeaders(headers) {
    const copy = this.clone();
    const next = new Headers(headers);
    next.forEach((value, key) => {
      copy.headers.set(key, value);
    });
    return copy;
  }
  withStatus(status, statusText) {
    return new WebResponse(this.body, {
      ...this.options,
      status,
      statusText: statusText ?? this.statusText
    });
  }
  withBody(body) {
    return new WebResponse(body, this.options);
  }
  withCors() {
    return this.clone().withHeaders(HEADERS.CORS);
  }
  /**
   * Calling this will return a clone of the response with the body
   * converted to a JSON object (if it is not already a JSON object),
   * and the content type set to `application/json`.
   */
  toJson() {
    return this.clone().withHeaders({
      "Content-Type": "application/json"
    }).withBody(
      typeof this.body === "string" ? JSON.parse(this.body) : this.body
    );
  }
}

const prerender = false;
const GET = async ({
  locals: { user = void 0, isLoggedIn = false }
}) => {
  return WebResponse.OK({ user, isLoggedIn });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
