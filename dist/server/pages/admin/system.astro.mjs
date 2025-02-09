/* empty css                                    */
import { b as createAstro, c as createComponent, r as renderTemplate, a as renderComponent, d as renderHead, e as addAttribute } from '../../chunks/astro/server_DmNz8cFp.mjs';
import 'kleur/colors';
import { $ as $$BaseHead } from '../../chunks/BaseHead_eNYzOnOe.mjs';
import { s as siteData } from '../../chunks/consts_DA6-2Sut.mjs';
/* empty css                                    */
import clsx from 'clsx';
import { $ as $$AdminPanelSidebar } from '../../chunks/AdminPanelSidebar_CVBb8KTM.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://asleepace.com");
const prerender = false;
const $$System = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$System;
  const { user, isLoggedIn } = Astro2.locals;
  if (!isLoggedIn || !user) {
    console.warn("[admin] not authorized, be gone!");
    return Astro2.redirect("/login");
  }
  return renderTemplate`<html lang="en" class="h-full"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": siteData.title, "description": siteData.description })}${renderHead()}</head> <body class="flex flex-col flex-1 min-h-full w-full bg-black text-white overflow-x-hidden"> <main class="flex flex-row h-full flex-1 bg-zinc-950"> <!-- side bar --> ${renderComponent($$result, "AdminPanelSidebar", $$AdminPanelSidebar, { "activeTab": 1 })} <div class="flex h-full flex-row flex-1 overflow-hidden max-h-screen justify-center items-start gap-16 p-16"> <!-- welcome message & search bar --> <div class="flex gap-y-4 flex-col flex-1 self-stretch max-w-screen-xl"> <p class="text-6xl font-bold">⚙️ System</p> <p class="tracking-wide text-zinc-400 p-2">Detailed information on current system processess...</p> <!-- memory usage statistics --> <div${addAttribute(
    clsx(
      "flex flex-col flex-1 self-stretch min-h-[400px] mb-16 bg-zinc-900 overflow-auto rounded-xl",
      "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    ),
    "class"
  )}> ${renderComponent($$result, "ProcessInfoWidget", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/components/core/ProcessInfoWidget.tsx", "client:component-export": "ProcessInfoWidget" })} </div> </div> </div> </main> </body></html>`;
}, "/Users/asleepace/dev/asleepace.com/src/pages/admin/system.astro", void 0);

const $$file = "/Users/asleepace/dev/asleepace.com/src/pages/admin/system.astro";
const $$url = "/admin/system";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$System,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
