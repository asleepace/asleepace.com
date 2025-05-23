import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BdcOh6Mv.mjs';
import { manifest } from './manifest_DlV6wvO7.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/admin/login.astro.mjs');
const _page3 = () => import('./pages/admin/logout.astro.mjs');
const _page4 = () => import('./pages/admin/system.astro.mjs');
const _page5 = () => import('./pages/admin.astro.mjs');
const _page6 = () => import('./pages/api/analytics.astro.mjs');
const _page7 = () => import('./pages/api/auth/clearsession.astro.mjs');
const _page8 = () => import('./pages/api/auth.astro.mjs');
const _page9 = () => import('./pages/api/playground.astro.mjs');
const _page10 = () => import('./pages/api/proxy.astro.mjs');
const _page11 = () => import('./pages/api/session.astro.mjs');
const _page12 = () => import('./pages/api/shell/exec.astro.mjs');
const _page13 = () => import('./pages/api/shell/stream.astro.mjs');
const _page14 = () => import('./pages/api/system/command.astro.mjs');
const _page15 = () => import('./pages/api/system/info.astro.mjs');
const _page16 = () => import('./pages/api.astro.mjs');
const _page17 = () => import('./pages/blog.astro.mjs');
const _page18 = () => import('./pages/blog/_---slug_.astro.mjs');
const _page19 = () => import('./pages/code.astro.mjs');
const _page20 = () => import('./pages/playground.astro.mjs');
const _page21 = () => import('./pages/rss.xml.astro.mjs');
const _page22 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/admin/login.astro", _page2],
    ["src/pages/admin/logout.astro", _page3],
    ["src/pages/admin/system.astro", _page4],
    ["src/pages/admin/index.astro", _page5],
    ["src/pages/api/analytics/index.ts", _page6],
    ["src/pages/api/auth/clearSession.ts", _page7],
    ["src/pages/api/auth/index.ts", _page8],
    ["src/pages/api/playground/index.ts", _page9],
    ["src/pages/api/proxy/index.ts", _page10],
    ["src/pages/api/session/index.ts", _page11],
    ["src/pages/api/shell/exec.ts", _page12],
    ["src/pages/api/shell/stream.ts", _page13],
    ["src/pages/api/system/command.ts", _page14],
    ["src/pages/api/system/info.ts", _page15],
    ["src/pages/api/index.ts", _page16],
    ["src/pages/blog/index.astro", _page17],
    ["src/pages/blog/[...slug].astro", _page18],
    ["src/pages/code/index.astro", _page19],
    ["src/pages/playground.astro", _page20],
    ["src/pages/rss.xml.js", _page21],
    ["src/pages/index.astro", _page22]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///Users/asleepace/dev/asleepace.com/dist/client/",
    "server": "file:///Users/asleepace/dev/asleepace.com/dist/server/",
    "host": false,
    "port": 4321,
    "assets": "_astro"
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
