import { e as endpoint } from '../../chunks/index_us8lJ1Xd.mjs';
import { h as http } from '../../chunks/http_Dt5sa3ww.mjs';
import { W as WebResponse } from '../../chunks/WebResponse_Ctsx2gFv.mjs';
import { S as Sessions, U as Users } from '../../chunks/index_DBharnCd.mjs';
import { P as PATH } from '../../chunks/consts_DA6-2Sut.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const environment = process.env.ENVIRONMENT;
const isDevelopment = Boolean(environment === "development");
const isProduction = !isDevelopment;
const cookieDomain = isDevelopment ? "localhost" : process.env.COOKIE_DOMAIN;
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
const GET = endpoint(async ({ request }) => {
  const { oauthToken } = await http.parse(request);
  if (!oauthToken) return http.failure(401, "Unauthorized");
  const user = Sessions.findUser(oauthToken);
  return http.success(user);
});
const POST = async ({ request, locals, cookies }) => {
  console.log("[auth] POST /api/auth");
  const INVALID_LOGIN = "Invalid username or password";
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
    return WebResponse.redirect(PATH.ADMIN_LOGIN({ error: "bad_content" }), 302);
  }
  if (!username) return http.failure(400, INVALID_LOGIN);
  if (!password) return http.failure(400, INVALID_LOGIN);
  const user = Users.findUser({ username, email: username });
  if (!user) {
    console.log("[auth] user not found: ", username);
    return WebResponse.redirect(
      PATH.ADMIN_LOGIN({ error: "user_not_found" }),
      302
    );
  }
  const isPasswordValid = await Users.verifyPassword(user.password, password);
  if (!isPasswordValid) {
    console.log("[auth] invalid password");
    return WebResponse.redirect(
      PATH.ADMIN_LOGIN({ error: "invalid_password" }),
      302
    );
  }
  const session = Sessions.create(user.id);
  const sessionToken = session.token;
  const cookieOptions = {
    /** where the cookie is valid */
    path: "/",
    /** the domain that the cookie is valid for */
    domain: cookieDomain,
    /** javascript cannot access the cookie */
    httpOnly: true,
    /** if the cookie is only accessible via https */
    secure: isProduction,
    /** if the cookie is only accessible via the same site */
    sameSite: "lax",
    /** the expiration date of the cookie */
    expires: new Date(Date.now() + 1e3 * 60 * 60 * 24 * 30)
    // 30 days
  };
  cookies.set("session", sessionToken, cookieOptions);
  locals.isLoggedIn = true;
  locals.user = user;
  console.log("[auth] setting cookie:", cookieOptions);
  return WebResponse.redirect(PATH.ADMIN_HOME, 302);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
