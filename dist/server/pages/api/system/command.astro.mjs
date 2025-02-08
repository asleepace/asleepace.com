import { h as http } from '../../../chunks/http_CTAeCHox.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const HOME = String(process.env.HOME);
const WHOAMI = String(process.env.USER);
const PWD = String(process.env.PWD).replace(HOME, "~");
const POST = async ({ request }) => {
  const text = await request.text();
  if (!text) return http.failure(400, "No command provided");
  if (typeof text !== "string") return http.failure(400, "Invalid command");
  const cmds = text.trim().split(" ");
  if (cmds.length === 0) return http.failure(400, "No command provided");
  const process2 = Bun.spawn({
    cmd: [...cmds],
    stdout: "pipe"
  });
  const output = await new Response(process2.stdout).text();
  return http.success({
    command: cmds,
    whoami: WHOAMI,
    pwd: PWD,
    output
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
