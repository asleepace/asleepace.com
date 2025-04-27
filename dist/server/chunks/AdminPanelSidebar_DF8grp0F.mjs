import { b as createAstro, c as createComponent, m as maybeRenderHead, d as addAttribute, a as renderTemplate, r as renderComponent } from './astro/server_C-py2KQh.mjs';
import 'kleur/colors';
import { P as PATH } from './consts_DsjtsUmI.mjs';
import clsx from 'clsx';
import Icons__default from 'lucide-react';

const $$Astro$4 = createAstro("https://asleepace.com");
const $$Spacer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Spacer;
  const { direction = "vertical" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(clsx("flex-1", {
    "flex-col": direction === "vertical",
    "flex-row": direction === "horizontal"
  }), "class")}></div>`;
}, "/Users/asleepace/dev/asleepace.com/src/components/astro/Spacer.astro", void 0);

const $$Astro$3 = createAstro("https://asleepace.com");
const $$AdminPanelSidebarButton = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$AdminPanelSidebarButton;
  const { href, title, variant = "default", active = false, icon = "LayoutGrid", isFormSubmit = false } = Astro2.props;
  const ButtonIcon = icon && typeof icon === "string" && icon in Icons__default ? Icons__default[icon] : null;
  const onClickHref = isFormSubmit ? void 0 : href;
  const onClickForm = isFormSubmit ? "submit" : void 0;
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(onClickHref, "href")}${addAttribute(clsx("flex flex-col flex-shrink justify-end", active ? "opacity-100" : "opacity-80"), "class")}> <button${addAttribute(onClickForm, "type")}${addAttribute(
    clsx("flex flex-row gap-x-3 items-center justify-start rounded-md px-2 py-1 mx-2 bg-white/0 hover:bg-white/70", {
      "bg-zinc-800": variant === "default",
      "bg-red-700": variant === "destructive",
      "bg-white/50": active
    }),
    "class"
  )}> <!-- Icon --> ${renderComponent($$result, "ButtonIcon", ButtonIcon, { "name": icon, "size": 16 })} <!-- Title --> <p${addAttribute(clsx("text-md font-light"), "class")}>${title}</p> </button> </a>`;
}, "/Users/asleepace/dev/asleepace.com/src/components/admin/AdminPanelSidebarButton.astro", void 0);

const $$Astro$2 = createAstro("https://asleepace.com");
const $$AdminPanelProfile = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$AdminPanelProfile;
  const { username = "Admin", environment = "production", className, image = "/images/profile_asleepace.jpg" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(clsx("gap-x-3 items-center justify-start flex flex-row p-2", className), "class")}> <img${addAttribute(image, "src")} alt="Asleepace Logo" class="w-8 h-8 rounded-lg bg-zinc-800"> <div class="flex flex-col pt-1"> <p class="text-md font-light -mb-0.5 text-orange-400">${username}</p> <span class="flex flex-row gap-x-2"> <p class="text-3xs font-light opacity-60">${environment.toUpperCase()}</p> </span> </div> </div>`;
}, "/Users/asleepace/dev/asleepace.com/src/components/admin/AdminPanelProfile.astro", void 0);

const $$Astro$1 = createAstro("https://asleepace.com");
const $$Line = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Line;
  const { className } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(clsx("self-center h-[0.4px] bg-zinc-800 opacity-70 px-2 w-[calc(100%-1rem)]", className), "class")}></div>`;
}, "/Users/asleepace/dev/asleepace.com/src/components/astro/Line.astro", void 0);

const $$Astro = createAstro("https://asleepace.com");
const $$AdminPanelSidebar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AdminPanelSidebar;
  const { activeTab = 0, version = "1.0.0", environment = "production", username = "Admin" } = Astro2.props;
  const sideBarButtons = [
    { href: PATH.ADMIN_HOME, title: "Home", icon: "LayoutGrid" },
    { href: PATH.ADMIN_SYSTEM, title: "System", icon: "Settings" },
    { href: PATH.ADMIN_ANALYTICS, title: "Analytics", icon: "BarChart" },
    { href: PATH.CODE_EDITOR, title: "Code", icon: "Code" }
  ];
  return renderTemplate`${maybeRenderHead()}<aside class="w-52 bg-black pl-2 pr-4 py-8 gap-y-2 flex flex-col text-zinc-300"> ${renderComponent($$result, "AdminPanelProfile", $$AdminPanelProfile, { "environment": environment, "username": username, "className": "ml-1" })} ${renderComponent($$result, "Line", $$Line, { "className": "my-2" })} <!-- admin panel header section --> <div class="flex flex-col gap-y-2"> ${sideBarButtons.map((button, index) => renderTemplate`${renderComponent($$result, "AdminPanelSidebarButton", $$AdminPanelSidebarButton, { "href": button.href, "title": button.title, "active": activeTab === index, "icon": button.icon })}`)} </div> <!-- admin panel footer section --> ${renderComponent($$result, "Spacer", $$Spacer, { "direction": "vertical" })} <form method="post"${addAttribute(PATH.CLEAR_SESSION, "action")}> ${renderComponent($$result, "AdminPanelSidebarButton", $$AdminPanelSidebarButton, { "href": PATH.CLEAR_SESSION, "title": "Logout", "icon": "LogOut", "variant": "destructive", "isFormSubmit": true })} </form> </aside>`;
}, "/Users/asleepace/dev/asleepace.com/src/components/admin/AdminPanelSidebar.astro", void 0);

export { $$AdminPanelSidebar as $ };
