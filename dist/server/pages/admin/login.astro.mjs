/* empty css                                    */
import { b as createAstro, c as createComponent, r as renderTemplate, a as renderComponent, d as renderHead } from '../../chunks/astro/server_DmNz8cFp.mjs';
import 'kleur/colors';
import { $ as $$BaseHead } from '../../chunks/BaseHead_BE74BL6x.mjs';
import { $ as $$Header, a as $$Footer } from '../../chunks/Footer_BXiM9hNU.mjs';
import { s as siteData } from '../../chunks/consts_BT7Y9G2r.mjs';
import { CircleUser } from 'lucide-react';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://asleepace.com");
const prerender = false;
const route = "/admin/login";
const $$Login = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const error = Astro2.url.searchParams.get("error");
  const ERROR_CASES = {
    invalid_credentials: "Invalid username or password.",
    invalid_password: "Invalid password.",
    bad_content: "Invalid content type.",
    unknown: "An unknown error occurred: " + error
  };
  const message = error && error in ERROR_CASES ? ERROR_CASES[error] : error;
  return renderTemplate`<html lang="en"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": siteData.title, "description": siteData.description })}${renderHead()}</head> <body class="min-h-screen flex flex-col bg-white"> ${renderComponent($$result, "Header", $$Header, { "title": siteData.title })} <main class="flex flex-col flex-grow max-w-screen-lg justify-center items-center mx-auto p-4"> <div class="flex flex-col items-center gap-2 py-12 border-[1px] bg-white border-gray-300 rounded-md p-4"> ${renderComponent($$result, "CircleUser", CircleUser, { "className": "text-blue-500", "size": 84 })} <p class="text-4xl font-bold text-center">Admin</p> <p class="text-center text-gray-500">Please login to continue.</p> <!-- Login Form --> <form action="/api/auth" class="flex flex-col mt-4 gap-2 w-[300px]" method="post"> <input autofocus class="border border-gray-300 rounded-md p-2" autocomplete="email" id="username" type="text" name="username" placeholder="Username"> <input class="border border-gray-300 rounded-md p-2" autocomplete="current-password" id="password" type="password" name="password" placeholder="Password"> <button class="bg-blue-500 text-white rounded-md p-2" type="submit">Login</button> </form> ${message && renderTemplate`<p class="text-red-500 text-sm">${message}</p>`} </div></main> ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "/Users/asleepace/dev/asleepace.com/src/pages/admin/login.astro", void 0);

const $$file = "/Users/asleepace/dev/asleepace.com/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  prerender,
  route,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
