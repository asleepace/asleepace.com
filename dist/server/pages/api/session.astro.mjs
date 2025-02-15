import '../../chunks/consts_-x9zbxjG.mjs';
import { W as WebResponse } from '../../chunks/WebResponse_CKUXSAVZ.mjs';
export { renderers } from '../../renderers.mjs';

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
