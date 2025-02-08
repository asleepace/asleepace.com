/* empty css                                 */
import { b as createAstro, c as createComponent, r as renderTemplate, a as renderComponent, d as renderHead } from '../chunks/astro/server_DmNz8cFp.mjs';
import 'kleur/colors';
import { $ as $$BaseHead } from '../chunks/BaseHead_DGWSCeWb.mjs';
import { $ as $$Header, a as $$Footer } from '../chunks/Footer_BqLq9Nym.mjs';
import { s as siteData } from '../chunks/consts_CaV8g65M.mjs';
import { CircleUser } from 'lucide-react';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://asleepace.com");
const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  if (Astro2.locals.isLoggedIn) {
    return Astro2.redirect("/admin");
  }
  return renderTemplate`<html lang="en"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": siteData.title, "description": siteData.description })}${renderHead()}</head> <body class="min-h-screen flex flex-col bg-white"> ${renderComponent($$result, "Header", $$Header, { "title": siteData.title })} <main class="flex flex-col flex-grow max-w-screen-lg justify-center items-center mx-auto px-4"> <div class="flex flex-col items-center gap-2"> ${renderComponent($$result, "CircleUser", CircleUser, { "className": "text-gray-400", "size": 96 })} <p class="text-5xl font-bold text-center">Login</p> <p class="text-center">Please login to continue.</p> <form action="/api/auth" class="flex flex-col gap-2 w-[300px]" method="post"> <input class="border border-gray-300 rounded-md p-2" id="username" type="text" name="username" placeholder="Username"> <input class="border border-gray-300 rounded-md p-2" id="password" type="password" name="password" placeholder="Password"> <button class="bg-blue-500 text-white rounded-md p-2" type="submit">Login</button> </form> </div></main> ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "/Users/asleepace/dev/asleepace.com/src/pages/login/index.astro", void 0);

const $$file = "/Users/asleepace/dev/asleepace.com/src/pages/login/index.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
