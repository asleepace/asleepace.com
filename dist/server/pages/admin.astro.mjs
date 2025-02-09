/* empty css                                 */
import { b as createAstro, c as createComponent, r as renderTemplate, m as maybeRenderHead, e as addAttribute, f as renderSlot, a as renderComponent, d as renderHead } from '../chunks/astro/server_DmNz8cFp.mjs';
import 'kleur/colors';
import { $ as $$BaseHead } from '../chunks/BaseHead_eNYzOnOe.mjs';
import { P as PATH, s as siteData } from '../chunks/consts_DA6-2Sut.mjs';
/* empty css                                 */
import { $ as $$AdminPanelSidebar } from '../chunks/AdminPanelSidebar_CVBb8KTM.mjs';
import clsx from 'clsx';
export { renderers } from '../renderers.mjs';

const $$Astro$2 = createAstro("https://asleepace.com");
const $$AdminPageInfo = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$AdminPageInfo;
  const { data } = Astro2.props;
  const entries = Object.entries(data).reverse();
  return renderTemplate`${maybeRenderHead()}<div class="flex flex-col gap-y-2 p-2 flex-grow"> ${entries.map(([key, value]) => renderTemplate`<div class="flex flex-row gap-x-2 flex-grow items-baseline"${addAttribute(`navigator.clipboard.writeText('${value}')`, "onclick")}> <p class="text-xs text-zinc-300 font-bold font-mono tracking-wider">${key}</p> <pre class="text-xs text-zinc-500">${value}</pre> </div>`)} </div>`;
}, "/Users/asleepace/dev/asleepace.com/src/components/admin/AdminPageInfo.astro", void 0);

const $$Astro$1 = createAstro("https://asleepace.com");
const $$ContainerLabeled = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$ContainerLabeled;
  const { textColor = "text-zinc-700", borderColor = "border-zinc-700", className, label } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`${label} Section`, "aria-label")}> <p${addAttribute(label, "aria-label")}${addAttribute(clsx(`text-xs font-bold font-mono uppercase rounded-xl tracking-widest inline-block relative top-4 px-2 z-50 bg-zinc-950 ml-6`, textColor), "class")}>${label}</p> <div${addAttribute(clsx(`flex flex-col rounded-2xl border-2 border-solid`, borderColor, className), "class")}> <div class="flex flex-col gap-y-2 p-1 mt-3 pt-0 flex-grow overflow-auto w-full scrollbar-none shadow-inner-lg scrollbar-none"> ${renderSlot($$result, $$slots["default"])} </div> </div> </div>`;
}, "/Users/asleepace/dev/asleepace.com/src/components/astro/ContainerLabeled.astro", void 0);

const $$Astro = createAstro("https://asleepace.com");
const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { user, isLoggedIn } = Astro2.locals;
  if (!isLoggedIn || !user) {
    console.warn("[/admin] not logged in!");
    console.warn("[/admin] redirecting...");
    return Astro2.redirect(PATH.ADMIN_LOGOUT, 302);
  }
  const adminPageInfo = {
    ...process.env
  };
  return renderTemplate`<html lang="en" class="h-full"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": siteData.title, "description": siteData.description })}${renderHead()}</head> <body class="flex flex-col flex-1 min-h-full w-full bg-black text-white overflow-x-hidden"> <main class="flex flex-row h-full flex-1 bg-zinc-950"> <!-- side bar --> ${renderComponent($$result, "AdminPanelSidebar", $$AdminPanelSidebar, { "activeTab": 0 })} <div class="flex h-full flex-row flex-1 overflow-hidden max-h-screen justify-center items-start gap-16 p-16"> <!-- welcome message & search bar --> <div class="flex flex-col gap-y-4 flex-1 self-stretch max-w-screen-xl"> <p class="text-6xl font-bold">Admin Panel</p> <p class="tracking-wide text-zinc-400 py-2">Welcome to the admin page <strong>${user.username}!</strong></p> ${renderComponent($$result, "AdminCommandLine", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/components/admin/AdminCommandLine", "client:component-export": "default" })} </div> ${renderComponent($$result, "ContainerLabeled", $$ContainerLabeled, { "label": "Environment", "className": "basis-1/4 max-w-screen-xs max-h-[600px]" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminPageInfo", $$AdminPageInfo, { "data": adminPageInfo })} ` })} </div> </main> </body></html>`;
}, "/Users/asleepace/dev/asleepace.com/src/pages/admin/index.astro", void 0);

const $$file = "/Users/asleepace/dev/asleepace.com/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
