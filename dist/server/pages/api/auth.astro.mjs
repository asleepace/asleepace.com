import { e as endpoint } from '../../chunks/index_IKKZRfRd.mjs';
import { h as http } from '../../chunks/http_CTAeCHox.mjs';
import { S as Sessions, U as Users } from '../../chunks/index_9dWHXndf.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const isDevelopment = Boolean(process.env.ENVIRONMENT === "development");
const isProduction = !isDevelopment;
const cookieDomain = isDevelopment ? void 0 : process.env.COOKIE_DOMAIN;
console.log("[auth] config:", JSON.stringify({
  isDevelopment,
  isProduction,
  cookieDomain
}, null, 2));
const GET = endpoint(async ({ request }) => {
  const { oauthToken } = await http.parse(request);
  if (!oauthToken) return http.failure(401, "Unauthorized");
  const user = Sessions.findUser(oauthToken);
  return http.success(user);
});
const POST = endpoint(async ({ request, cookies }) => {
  console.log("POST /api/auth", request);
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
    return http.failure(400, "Invalid content type");
  }
  if (!username) return http.failure(400, INVALID_LOGIN);
  if (!password) return http.failure(400, INVALID_LOGIN);
  const user = Users.findUser({ username, email: username });
  if (!user) return http.failure(401, INVALID_LOGIN);
  const isPasswordValid = await Users.verifyPassword(user.password, password);
  if (!isPasswordValid) return http.failure(401, INVALID_LOGIN);
  const session = Sessions.create(user.id);
  const sessionToken = session.token;
  cookies.set("session", sessionToken, {
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
  });
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/admin",
      "Cache-Control": "no-store, no-cache, must-revalidate"
    }
  });
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
