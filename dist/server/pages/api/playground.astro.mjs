export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async ({ request }) => {
  const url = new URL(request.url);
  console.log("[playground] new incoming url: ", url);
  return Response.json({ ok: true });
};
const POST = async ({ request }) => {
  const url = new URL(request.url);
  console.log("[playground] new incoming url: ", url);
  return Response.json({ ok: true });
};
const DELETE = async ({ request }) => {
  const url = new URL(request.url);
  console.log("[playground] new incoming url: ", url);
  return Response.json({ ok: true });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
