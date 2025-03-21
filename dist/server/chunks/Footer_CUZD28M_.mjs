import { b as createAstro, c as createComponent, r as renderTemplate, m as maybeRenderHead, e as addAttribute, s as spreadAttributes, f as renderSlot, a as renderComponent, g as renderScript } from './astro/server_DmNz8cFp.mjs';
import 'kleur/colors';
/* empty css                         */
import 'clsx';
import { S as SITE_TITLE } from './consts_-x9zbxjG.mjs';

const $$Astro = createAstro("https://asleepace.com");
const $$HeaderLink = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$HeaderLink;
  const { href, class: className, ...props } = Astro2.props;
  const pathname = Astro2.url.pathname.replace("/", "");
  const subpath = pathname.match(/[^\/]+/g);
  const isActive = href === pathname || href === "/" + (subpath?.[0] || "");
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(href, "href")}${addAttribute([className, { active: isActive }], "class:list")}${spreadAttributes(props)} data-astro-cid-xvislcag> ${renderSlot($$result, $$slots["default"])} </a> `;
}, "/Users/asleepace/dev/asleepace.com/src/components/astro/HeaderLink.astro", void 0);

const $$Header = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header data-astro-cid-mq3pp5jd> <nav data-astro-cid-mq3pp5jd> <div class="title-and-logo" data-astro-cid-mq3pp5jd> <img src="/images/logo.png" width="44" height="44" data-astro-cid-mq3pp5jd> <h2 class="xs:hidden" data-astro-cid-mq3pp5jd><a class="font-black text-lg" href="/" data-astro-cid-mq3pp5jd>${SITE_TITLE}</a></h2> </div> <div class="internal-links" data-astro-cid-mq3pp5jd> ${renderComponent($$result, "HeaderLink", $$HeaderLink, { "href": "/", "data-astro-cid-mq3pp5jd": true }, { "default": ($$result2) => renderTemplate`Home` })} ${renderComponent($$result, "HeaderLink", $$HeaderLink, { "href": "/blog", "data-astro-cid-mq3pp5jd": true }, { "default": ($$result2) => renderTemplate`Blog` })} ${renderComponent($$result, "HeaderLink", $$HeaderLink, { "href": "/about", "data-astro-cid-mq3pp5jd": true }, { "default": ($$result2) => renderTemplate`About` })} </div> <div class="social-links" data-astro-cid-mq3pp5jd> <a href="https://twitter.com/asleepace" target="_blank" data-astro-cid-mq3pp5jd> <span class="sr-only" data-astro-cid-mq3pp5jd>Follow Asleepace on Twitter</span> <svg viewBox="0 0 16 16" aria-hidden="true" width="32" height="32" - data-astro-cid-mq3pp5jd><path fill="currentColor" d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" data-astro-cid-mq3pp5jd></path></svg> </a> <a href="https://github.com/asleepace" target="_blank" data-astro-cid-mq3pp5jd> <span class="sr-only" data-astro-cid-mq3pp5jd>Go to Asleepace's GitHub repo</span> <svg viewBox="0 0 16 16" aria-hidden="true" width="32" height="32" data-astro-cid-mq3pp5jd><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" data-astro-cid-mq3pp5jd></path></svg> </a> </div> </nav> </header> `;
}, "/Users/asleepace/dev/asleepace.com/src/components/astro/Header.astro", void 0);

const $$Analytics = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderScript($$result, "/Users/asleepace/dev/asleepace.com/src/components/astro/Analytics.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/asleepace/dev/asleepace.com/src/components/astro/Analytics.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const today = /* @__PURE__ */ new Date();
  const fullYear = today.getFullYear();
  return renderTemplate`${maybeRenderHead()}<footer data-astro-cid-lejjx2fa>
&copy; ${fullYear} Colin Teahan. All rights reserved.
<div class="social-links" data-astro-cid-lejjx2fa> <a href="https://twitter.com/Asleepace" target="_blank" data-astro-cid-lejjx2fa> <svg viewBox="0 0 16 16" aria-hidden="true" width="32" height="32" astro-icon="social/twitter" data-astro-cid-lejjx2fa><path fill="currentColor" d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" data-astro-cid-lejjx2fa></path></svg> </a> <a href="https://github.com/Asleepace" target="_blank" data-astro-cid-lejjx2fa> <svg viewBox="0 0 16 16" aria-hidden="true" width="32" height="32" astro-icon="social/github" data-astro-cid-lejjx2fa><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" data-astro-cid-lejjx2fa></path></svg> </a> </div> <!-- perform some simple analytics tracking --> ${renderComponent($$result, "Analytics", $$Analytics, { "data-astro-cid-lejjx2fa": true })} </footer> `;
}, "/Users/asleepace/dev/asleepace.com/src/components/astro/Footer.astro", void 0);

export { $$Header as $, $$Footer as a };
