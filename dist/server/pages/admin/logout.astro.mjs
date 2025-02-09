/* empty css                                    */
import { b as createAstro, c as createComponent, r as renderTemplate, a as renderComponent, d as renderHead, e as addAttribute } from '../../chunks/astro/server_DmNz8cFp.mjs';
import 'kleur/colors';
import { $ as $$BaseHead } from '../../chunks/BaseHead_BE74BL6x.mjs';
import { $ as $$Header, a as $$Footer } from '../../chunks/Footer_D4wMDdUT.mjs';
import { P as PATH, s as siteData } from '../../chunks/consts_Bbo_36Xm.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://asleepace.com");
const prerender = false;
const $$Logout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Logout;
  const COOKIE_PATH = "/";
  console.warn("[/admin/logout] clearing session...");
  Astro2.cookies.delete("session", {
    path: COOKIE_PATH
    // IMPORTANT: must match the path that was set in the cookie.
  });
  Astro2.redirect(PATH.ADMIN_LOGIN());
  return renderTemplate`<html lang="en"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": siteData.title, "description": siteData.description })}${renderHead()}</head> <body class="min-h-screen flex flex-col bg-white"> ${renderComponent($$result, "Header", $$Header, { "title": siteData.title })} <main class="flex flex-col flex-grow max-w-screen-lg justify-center items-center mx-auto p-4"> <div class="flex flex-col items-center gap-4 bg-white rounded-md p-8 py-12 min-w-screen-sm"> <p class="text-7xl">👋</p> <p class="text-5xl font-bold text-center">Goodbye!</p> <p class="text-center px-2">Come back soon.</p> <div class="flex flex-col items-center gap-2"> <a${addAttribute(PATH.ADMIN_LOGIN(), "href")}> <button class="bg-blue-500 hover:bg-blue-400 w-full px-16 text-white rounded-md p-2">Go to login</button> </a> </div> </div></main> ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "/Users/asleepace/dev/asleepace.com/src/pages/admin/logout.astro", void 0);

const $$file = "/Users/asleepace/dev/asleepace.com/src/pages/admin/logout.astro";
const $$url = "/admin/logout";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Logout,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
