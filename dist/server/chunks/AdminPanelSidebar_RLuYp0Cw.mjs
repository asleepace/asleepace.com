import { b as createAstro, c as createComponent, r as renderTemplate, m as maybeRenderHead, e as addAttribute, a as renderComponent } from './astro/server_DmNz8cFp.mjs';
import 'kleur/colors';
import clsx from 'clsx';

const $$Astro$2 = createAstro("https://asleepace.com");
const $$Spacer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Spacer;
  const { direction = "vertical" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(clsx("flex-1", {
    "flex-col": direction === "vertical",
    "flex-row": direction === "horizontal"
  }), "class")}></div>`;
}, "/Users/asleepace/dev/asleepace.com/src/components/astro/Spacer.astro", void 0);

const $$Astro$1 = createAstro("https://asleepace.com");
const $$AdminPanelSidebarButton = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$AdminPanelSidebarButton;
  const { href, title, variant = "default", active = false } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(href, "href")} class="flex flex-col flex-shrink justify-end"> <button${addAttribute(clsx("bg-transparent rounded-md p-2 mx-2", {
    "hover:bg-red-600": variant === "destructive",
    "hover:bg-blue-600": variant === "primary",
    "hover:bg-zinc-600": variant === "default"
  }), "class")}> <p${addAttribute(clsx({ "text-orange-500": active }), "class")}>${title}</p> </button> </a>`;
}, "/Users/asleepace/dev/asleepace.com/src/components/admin/AdminPanelSidebarButton.astro", void 0);

const $$Astro = createAstro("https://asleepace.com");
const $$AdminPanelSidebar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AdminPanelSidebar;
  const { activeTab = 0 } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<aside class="w-64 bg-black px-2 py-16 pb-4 gap-y-2 flex flex-col text-zinc-300"> ${renderComponent($$result, "AdminPanelSidebarButton", $$AdminPanelSidebarButton, { "href": "/admin", "title": "Home", "active": activeTab === 0 })} ${renderComponent($$result, "AdminPanelSidebarButton", $$AdminPanelSidebarButton, { "href": "/admin/system", "title": "System", "active": activeTab === 1 })} ${renderComponent($$result, "AdminPanelSidebarButton", $$AdminPanelSidebarButton, { "href": "/admin/analytics", "title": "Analytics", "active": activeTab === 2 })} ${renderComponent($$result, "Spacer", $$Spacer, { "direction": "vertical" })} ${renderComponent($$result, "AdminPanelSidebarButton", $$AdminPanelSidebarButton, { "href": "/logout", "title": "Logout", "variant": "destructive" })} </aside>`;
}, "/Users/asleepace/dev/asleepace.com/src/components/admin/AdminPanelSidebar.astro", void 0);

export { $$AdminPanelSidebar as $ };
