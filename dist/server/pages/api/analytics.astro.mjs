import { e as endpoint } from '../../chunks/index_IKKZRfRd.mjs';
import { A as Analytics } from '../../chunks/index_9dWHXndf.mjs';
import { h as http } from '../../chunks/http_CTAeCHox.mjs';
import { g as getIpAddressFromHeaders } from '../../chunks/ipAddress_bVurJUOX.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = endpoint(async ({ request }) => {
  const { headers } = request;
  const ipAddress = getIpAddressFromHeaders(headers);
  const userAgent = headers.get("user-agent");
  const sessionId = headers.get("session");
  const referrer = headers.get("referer");
  Analytics.track({
    path: request.url,
    ipAddress,
    userAgent,
    sessionId,
    referrer
  });
  return http.success({ ipAddress });
});
const GET = endpoint(async ({ request, locals }) => {
  if (!locals.isLoggedIn) return http.failure(401, "Unauthorized");
  const { searchParams } = await http.parse(request);
  const limit = parseInt(searchParams["limit"]) ?? 100;
  const offset = parseInt(searchParams["offset"]) ?? 0;
  const data = Analytics.fetchAnalytics(limit, offset);
  return http.success({ data, limit, offset });
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
