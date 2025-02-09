/* empty css                                    */
import { b as createAstro, c as createComponent, r as renderTemplate, a as renderComponent, e as addAttribute, d as renderHead } from '../../chunks/astro/server_DmNz8cFp.mjs';
import 'kleur/colors';
import { $ as $$BaseHead } from '../../chunks/BaseHead_eNYzOnOe.mjs';
import { $ as $$Header, a as $$Footer } from '../../chunks/Footer_C9-NFdKz.mjs';
import { P as PATH, s as siteData } from '../../chunks/consts_DA6-2Sut.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://asleepace.com");
const prerender = false;
const $$Logout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Logout;
  console.warn("[/admin/logout] clearing session...");
  Astro2.cookies.delete("session");
  Astro2.locals.isLoggedIn = false;
  Astro2.locals.user = void 0;
  console.log("[/admin/logout] redirecting ...");
  const META_REFRESH = `3; url=${PATH.ADMIN_LOGIN()}`;
  return renderTemplate`<html lang="en"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": siteData.title, "description": siteData.description })}<!-- NOTE: REDIRECT HAPPENS HERE --><meta${addAttribute(META_REFRESH, "http-equiv")}>${renderHead()}</head> <body class="min-h-screen flex flex-col bg-white"> ${renderComponent($$result, "Header", $$Header, { "title": siteData.title })} <main class="flex flex-col flex-grow max-w-screen-lg justify-center items-center mx-auto px-4"> <div class="flex flex-col gap-2"> <p class="text-5xl font-bold text-center">Goodbye! 👋</p> <p class="text-center">You are now logged out, please come back soon!</p> <div class="flex flex-col items-center gap-2"> <a href="/"> <button class="bg-blue-500 text-white rounded-md p-2">Go to Home</button> </a> <a${addAttribute(PATH.ADMIN_LOGIN(), "href")}> <button class="bg-green-500 w-full text-white rounded-md p-2">Login</button> </a> </div> </div></main> ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
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
