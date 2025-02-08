/* empty css                                 */
import { b as createAstro, c as createComponent } from '../chunks/astro/server_DmNz8cFp.mjs';
import 'kleur/colors';
import 'clsx';
import '../chunks/BaseHead_DGWSCeWb.mjs';
import '../chunks/Footer_BqLq9Nym.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://asleepace.com");
const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  console.log("[logout] deleting session...");
  Astro2.cookies.delete("session");
  return Astro2.redirect("/login", 302);
}, "/Users/asleepace/dev/asleepace.com/src/pages/logout/index.astro", void 0);

const $$file = "/Users/asleepace/dev/asleepace.com/src/pages/logout/index.astro";
const $$url = "/logout";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
