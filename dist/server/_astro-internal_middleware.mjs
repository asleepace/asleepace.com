import { S as Sessions, A as Analytics } from './chunks/index_9dWHXndf.mjs';
import { g as getIpAddressFromHeaders } from './chunks/ipAddress_bVurJUOX.mjs';
import { s as sequence, d as defineMiddleware } from './chunks/index_DGL2UL-f.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_CP0-NeA3.mjs';
import '@astrojs/internal-helpers/path';
import 'cookie';

const authMiddleware = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next();
  const sessionCookie = context.cookies.get("session");
  const user = Sessions.getUser(sessionCookie?.value);
  context.locals.isLoggedIn = Boolean(user);
  context.locals.user = user;
  return next();
});
const analyticsMiddleware = defineMiddleware((context, next) => {
  if (context.isPrerendered) return next();
  const { request, cookies } = context;
  const { headers } = request;
  if (request.url.includes("/api/analytics")) return next();
  const referrer = headers.get("referer");
  const userAgent = headers.get("user-agent");
  const ipAddress = getIpAddressFromHeaders(headers);
  const sessionId = cookies.get("session")?.value;
  Analytics.track({
    path: context.url.href,
    userAgent: userAgent ?? void 0,
    ipAddress: ipAddress ?? void 0,
    sessionId: sessionId ?? void 0,
    referrer: referrer ?? void 0
  });
  return next();
});
const onRequest$1 = sequence(analyticsMiddleware, authMiddleware);

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
