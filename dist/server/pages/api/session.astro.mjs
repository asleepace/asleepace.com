import { e as endpoint } from '../../chunks/index_BajHgFuI.mjs';
import { h as http } from '../../chunks/http_NXgto6Mv.mjs';
import { S as Sessions } from '../../chunks/index_9dWHXndf.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = endpoint(async ({ request }) => {
  const { oauthToken, authType } = await http.parse(request);
  if (!oauthToken || !authType) {
    return http.failure(401, "Unauthorized");
  }
  const user = Sessions.findUser(oauthToken);
  return http.success(user);
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
