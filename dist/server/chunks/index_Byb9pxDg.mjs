import { h as http } from './http_CogIbPJW.mjs';

const prerender = false;
class Exception extends Error {
  /**
   *  Create a new Exception from an unknown error.
   */
  static from(e, message) {
    return new Exception(e, message);
  }
  /**
   *  Throw an exception if the condition is not true.
   */
  static assert(condition, code, message) {
    if (!Boolean(condition)) throw new Exception(code, message);
  }
  static throw(code, message) {
    throw new Exception(code, message);
  }
  static isError(error) {
    return error instanceof Exception || error instanceof Error;
  }
  static CODES = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway"
  };
  code = 500;
  text = "Internal Server Error";
  constructor(error, message) {
    if (!error) {
      super("Internal Server Error");
    } else if (error instanceof Exception) {
      super(error?.message || "Internal Server Error");
    } else if (typeof error === "number" && message) {
      super(message);
      this.code = error;
    } else if (error instanceof Error) {
      super(error.message);
    } else if (typeof error === "string") {
      super(error);
    } else if (typeof error === "number") {
      super(Exception.CODES[error] || "Internal Server Error");
      this.code = error || 500;
    } else {
      super(String(error) || "Internal Server Error");
    }
  }
}
function endpoint(route) {
  return async (ctx) => {
    try {
      const result = route(ctx);
      if (result instanceof Promise) {
        return await result;
      } else {
        return result;
      }
    } catch (e) {
      console.error(`[api/index] error ${ctx.request.url}:`, e);
      const error = new Exception(e);
      return http.failure(error.code, error.text);
    }
  };
}
const GET = endpoint(() => {
  return http.success({ status: "online" });
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  Exception,
  GET,
  endpoint,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

export { Exception as E, _page as _, endpoint as e };
