import 'es-module-lexer';
import './chunks/astro-designed-error-pages_CP0-NeA3.mjs';
import '@astrojs/internal-helpers/path';
import 'cookie';
import { d as defineMiddleware, s as sequence } from './chunks/index_DGL2UL-f.mjs';
import { S as Sessions, A as Analytics } from './chunks/index_cCZ8Gi1v.mjs';
import { g as getIpAddressFromHeaders } from './chunks/ipAddress_bVurJUOX.mjs';

const sessionMiddleware = defineMiddleware(async (context, next) => {
  context.locals.isLoggedIn = false;
  context.locals.user = void 0;
  if (context.isPrerendered) return next();
  console.log(
    "[auth][middleware]:",
    context.request.method,
    context.url.pathname
  );
  const sessionCookie = context.cookies.get("session")?.value;
  if (!sessionCookie) return next();
  const user = await Sessions.getUser(sessionCookie).catch((e) => {
    console.warn("[authMiddleware] no user for:", sessionCookie, e);
    return void 0;
  });
  console.log("[auth] session:", user?.username);
  context.locals.isLoggedIn = Boolean(user);
  context.locals.user = user;
  return next();
});

const analyticsMiddleware = defineMiddleware(
  ({ request, url, cookies, isPrerendered }, next) => {
    try {
      if (isPrerendered) return next();
      if (url.pathname.startsWith("/api/analytics")) return next();
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
    } catch (e) {
      console.warn("[analytics][middleware] error:", url.pathname, e?.message);
    } finally {
      return next();
    }
  }
);

const onRequest$1 = sequence(analyticsMiddleware, sessionMiddleware);

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
