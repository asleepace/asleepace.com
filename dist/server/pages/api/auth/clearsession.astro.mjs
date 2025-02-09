import { C as COOKIE_PATH, P as PATH } from '../../../chunks/consts_By69ZWqL.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const route = "/api/auth/clearSession";
const POST = async ({ cookies, redirect }) => {
  console.log(`
POST ${route} clearSession: '${COOKIE_PATH}'`);
  cookies.delete("session", { path: COOKIE_PATH });
  return redirect(PATH.ADMIN_LOGIN());
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender,
  route
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
