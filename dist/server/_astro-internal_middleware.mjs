import 'es-module-lexer';
import './chunks/astro-designed-error-pages_CP0-NeA3.mjs';
import '@astrojs/internal-helpers/path';
import 'cookie';
import { d as defineMiddleware, s as sequence } from './chunks/index_DGL2UL-f.mjs';
import { S as Sessions, A as Analytics } from './chunks/index_cCZ8Gi1v.mjs';
import chalk from 'chalk';
import { g as getIpAddressFromHeaders } from './chunks/ipAddress_bVurJUOX.mjs';
import { P as PATH } from './chunks/consts_By69ZWqL.mjs';

const TAG$3 = chalk.gray("[m] session	");
const sessionMiddleware = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next();
  console.log(
    TAG$3,
    chalk.gray(context.url.pathname),
    chalk.gray(`(${context.request.method.toLowerCase()})`)
  );
  const sessionCookie = context.cookies.get("session");
  const cookieString = sessionCookie?.value;
  const user = await Sessions.getUser(cookieString).catch((e) => {
    console.warn(TAG$3, chalk.red("BAD_COOKIE:"), sessionCookie, e);
    return void 0;
  });
  context.locals.isLoggedIn = Boolean(user);
  context.locals.user = user;
  return next();
});

const TAG$2 = chalk.gray("[m] analytics	");
const analyticsMiddleware = defineMiddleware(
  ({ request, url, cookies, isPrerendered }, next) => {
    if (isPrerendered) return next();
    if (url.pathname.startsWith("/api/analytics")) return next();
    if (request.method === "POST") return next();
    console.log(TAG$2, chalk.gray(url.pathname));
    const { headers } = request;
    const referrer = headers.get("referer");
    const userAgent = headers.get("user-agent");
    const ipAddress = getIpAddressFromHeaders(headers);
    const sessionId = cookies.get("session")?.value;
    Analytics.track({
      path: url.pathname,
      userAgent: userAgent ?? void 0,
      ipAddress: ipAddress ?? void 0,
      sessionId: sessionId ?? void 0,
      referrer: referrer ?? void 0
    });
    return next();
  }
);

const TAG$1 = chalk.gray("[m] cors	");
const corsMiddleware = defineMiddleware(async (context, next) => {
  const response = await next();
  console.log(TAG$1, chalk.gray(context.url.pathname));
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, HEAD"
  );
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Allow-Credentials", "true");
  return new Response(response.body, {
    status: response.status,
    headers
  });
});

const TAG = chalk.gray("[m] security	");
const whitelist = ["/admin/logout", "/admin/login", "/api/proxy"];
const blacklist = ["/api", "/admin"];
const securityMiddleware = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next();
  if (context.request.method !== "GET") return next();
  if (context.locals.isLoggedIn) return next();
  const path = context.url.pathname;
  const isWhitelisted = whitelist.some((p) => path.startsWith(p));
  const isBlacklisted = blacklist.some((p) => path.startsWith(p));
  if (isWhitelisted) {
    console.log(TAG, chalk.gray(path), chalk.white(`(whitelisted)`));
    return next();
  } else if (isBlacklisted) {
    console.log(TAG, chalk.gray(path), chalk.red(`(blacklisted)`));
    return context.redirect(PATH.ADMIN_LOGIN(), 302);
  } else {
    console.log(TAG, chalk.gray(path), chalk.gray(`(skipping...)`));
    return next();
  }
});

const onRequest$1 = sequence(
  analyticsMiddleware,
  sessionMiddleware,
  securityMiddleware,
  corsMiddleware
);

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
