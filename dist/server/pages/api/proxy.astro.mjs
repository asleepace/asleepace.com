import { h as http } from '../../chunks/http_DcLcmgav.mjs';
import { e as endpoint, E as Exception } from '../../chunks/index_Drlln7Y2.mjs';
export { renderers } from '../../renderers.mjs';

function isURL(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}
function isResponse(response) {
  return response instanceof Response;
}
function isNonNull(value) {
  return value !== null && value !== void 0;
}
function isSet(value) {
  return isNonNull(value);
}

class UserAgents {
  static MICROSOFT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
  static APPLE = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
}
const prerender = false;
const GET = endpoint(async ({ request }) => {
  const { searchParams } = await http.parse(request);
  const { uri } = searchParams;
  Exception.assert(isSet(uri), 400, "Missing URI parameter");
  Exception.assert(isURL(uri), 400, "Invalid URI parameter");
  const spoofedHost = new URL(uri).host;
  const headers = new Headers(request.headers);
  headers.has("user-agent") || headers.set("user-agent", UserAgents.APPLE);
  headers.has("accept") || headers.set("accept", "*/*");
  headers.delete("cookie");
  headers.delete("accept-language");
  headers.delete("sec-ch-ua");
  headers.delete("sec-ch-ua-mobile");
  headers.delete("sec-ch-ua-platform");
  headers.delete("x-forwarded-for");
  headers.delete("x-forwarded-host");
  headers.delete("x-forwarded-proto");
  headers.delete("forwarded");
  headers.delete("via");
  headers.set("accept-encoding", "identity");
  headers.set("x-forwarded-host", spoofedHost);
  headers.set("x-forwarded-for", "127.0.0.1");
  headers.set("host", spoofedHost);
  headers.set("referer", uri);
  headers.set("origin", uri);
  const response = await fetch(uri, {
    method: "GET",
    headers
  }).catch((e) => e);
  Exception.assert(isResponse(response), 500, String(response));
  return response.clone();
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
