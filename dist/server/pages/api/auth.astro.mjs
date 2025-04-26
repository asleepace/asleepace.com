import { U as Users, S as Sessions } from '../../chunks/index_cCZ8Gi1v.mjs';
import { C as COOKIE_PATH, P as PATH } from '../../chunks/consts_CF0Pd1PO.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const route = "/api/auth";
const environment = process.env.ENVIRONMENT;
const isDevelopment = Boolean(environment === "development");
const isProduction = !isDevelopment;
const cookieDomain = isDevelopment ? "localhost" : process.env.COOKIE_DOMAIN;
const THIRTY_DAYS = 1e3 * 60 * 60 * 24 * 30;
console.assert(cookieDomain, "COOKIE_DOMAIN env variable is not set!");
console.assert(
  environment === "development" || environment === "production",
  "ENVIRONMENT env variable is not set to development or production!"
);
console.log(
  "[auth] config:",
  JSON.stringify(
    {
      isDevelopment,
      isProduction,
      cookieDomain
    },
    null,
    2
  )
);
const POST = async ({
  request,
  locals,
  cookies,
  redirect
}) => {
  try {
    console.log(`
POST ${route}`);
    const CONTENT_TYPE_FORM = "application/x-www-form-urlencoded";
    const CONTENT_TYPE_JSON = "application/json";
    const contentType = request.headers.get("content-type") || request.headers.get("Content-Type");
    const isFormEncoded = contentType?.includes(CONTENT_TYPE_FORM);
    const isJsonEncoded = contentType?.includes(CONTENT_TYPE_JSON);
    let username;
    let password;
    if (isFormEncoded) {
      const formData = await request.formData();
      username = formData.get("username")?.toString();
      password = formData.get("password")?.toString();
    } else if (isJsonEncoded) {
      const body = await request.json();
      username = body.username;
      password = body.password;
    } else {
      throw new Error("bad_content");
    }
    if (!username) throw new Error("invalid_username");
    if (!password) throw new Error("invalid_password");
    const user = Users.findUser({ username, email: username });
    if (!user) throw new Error("user_not_found");
    const isPasswordValid = await Users.verifyPassword(user.password, password);
    if (!isPasswordValid) throw new Error("invalid_password");
    const session = Sessions.create(user.id);
    const sessionToken = session.token;
    const cookieOptions = {
      /** where the cookie is valid (must match to delete) */
      path: COOKIE_PATH,
      /** the domain that the cookie is valid for */
      domain: cookieDomain,
      /** javascript cannot access the cookie */
      httpOnly: true,
      /** if the cookie is only accessible via https */
      secure: isProduction,
      /** if the cookie is only accessible via the same site */
      sameSite: "lax",
      /** the expiration date of the cookie */
      expires: new Date(Date.now() + THIRTY_DAYS)
      // 30 days
    };
    cookies.set("session", sessionToken, cookieOptions);
    locals.isLoggedIn = true;
    locals.user = user;
    console.log("[auth] setting cookie:", cookieOptions);
    return redirect(PATH.ADMIN_HOME, 302);
  } catch (e) {
    console.error("[auth] error:", e);
    const error = e?.message ?? "unknown";
    return redirect(PATH.ADMIN_LOGIN({ error }), 302);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender,
  route
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
