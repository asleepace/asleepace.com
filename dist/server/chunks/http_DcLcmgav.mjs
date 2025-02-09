import { a as siteConfig } from './consts_By69ZWqL.mjs';

const http = {
  success,
  failure,
  response,
  parse,
  get,
  host
};
function host(path, searchParams) {
  const url = new URL(path, siteConfig.baseUrl);
  if (searchParams) {
    url.search = new URLSearchParams(searchParams).toString();
  }
  return url;
}
function encodeSafe(data) {
  try {
    return JSON.stringify(data);
  } catch (e) {
    console.warn("[http] failed to encode JSON:", e);
    return null;
  }
}
function response({
  data,
  status = 200,
  statusText = "OK",
  headers = {}
}) {
  return new Response(encodeSafe(data), {
    status,
    statusText,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  });
}
function success(data) {
  return response({ data, status: 200, statusText: "OK" });
}
function failure(status = 500, statusText = "Internal Server Error", data = {
  error: statusText,
  code: status
}) {
  console.warn("[http] failure:", data);
  return response({ data, status, statusText });
}
async function parse(request) {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const headers = Object.fromEntries(request.headers.entries());
  const contentType = request.headers.get("content-type");
  const contentLength = Number(request.headers.get("content-length"));
  const authorization = headers["Authorization"] || headers["authorization"];
  const [authType, oauthToken] = authorization?.split(" ") || [];
  const body = request.body && contentLength ? request.body : null;
  const getSearchParam = (key) => {
    const value = searchParams[key];
    return {
      decodeURIComponent: () => decodeURIComponent(value),
      unwrap: () => {
        if (!value) {
          throw new Error(`Missing required search param: ${key}`);
        }
        return value;
      }
    };
  };
  return {
    url,
    headers,
    contentType,
    body,
    searchParams,
    getSearchParam,
    oauthToken,
    authType
  };
}
function get(uri) {
  return fetch(uri, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });
}

export { http as h };
