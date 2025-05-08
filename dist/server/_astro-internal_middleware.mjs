import 'es-module-lexer';
import './chunks/astro-designed-error-pages_C1gNMLbh.mjs';
import '@astrojs/internal-helpers/path';
import 'kleur/colors';
import './chunks/astro/server_C-py2KQh.mjs';
import 'clsx';
import 'cookie';
import { d as defineMiddleware, s as sequence } from './chunks/index_DGSXGDg0.mjs';
import { S as Sessions, A as Analytics } from './chunks/index_q_DCTXEB.mjs';
import chalk from 'chalk';
import { g as getIpAddressFromHeaders } from './chunks/ipAddress_bVurJUOX.mjs';
import { P as PATH } from './chunks/consts_DsjtsUmI.mjs';

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

const TAG$1 = chalk.gray("[m] security	");
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
    console.log(TAG$1, chalk.gray(path), chalk.white(`(whitelisted)`));
    return next();
  } else if (isBlacklisted) {
    console.log(TAG$1, chalk.gray(path), chalk.red(`(blacklisted)`));
    return context.redirect(PATH.ADMIN_LOGIN(), 302);
  } else {
    console.log(TAG$1, chalk.gray(path), chalk.gray(`(skipping...)`));
    return next();
  }
});

let numberOfRequests = 0;
const TAG = (id) => chalk.gray(`[m]` + chalk.magenta(` REQ #${id}	`));
const rootMiddleware = defineMiddleware(async (context, next) => {
  let requestId = numberOfRequests++;
  let requestTag = TAG(requestId);
  try {
    if (context.isPrerendered) return next();
    context.locals.requestId = requestId;
    const method = context.request.method;
    const path = context.url.pathname;
    console.log("\n");
    console.log(requestTag, chalk.gray(method), chalk.cyan(path));
    const response = await next();
    console.log(requestTag, chalk.gray("setting headers"));
    return response;
  } catch (e) {
    console.error(requestTag, chalk.red(e));
    return new Response(e?.message, { status: 500 });
  } finally {
    console.log(chalk.gray(`[m][closed] REQ #${requestId}`));
  }
});

const onRequest$1 = sequence(
  rootMiddleware,
  analyticsMiddleware,
  sessionMiddleware,
  securityMiddleware
);

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
