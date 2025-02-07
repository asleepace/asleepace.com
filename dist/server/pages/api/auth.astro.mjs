import { e as endpoint } from '../../chunks/index_BajHgFuI.mjs';
import { h as http } from '../../chunks/http_NXgto6Mv.mjs';
import { S as Sessions, U as Users } from '../../chunks/index_9dWHXndf.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = endpoint(async ({ request }) => {
  const { oauthToken } = await http.parse(request);
  if (!oauthToken) return http.failure(401, "Unauthorized");
  const user = Sessions.findUser(oauthToken);
  return http.success(user);
});
const POST = endpoint(async ({ request }) => {
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
  return http.session({ sessionToken, redirectTo: "/admin" });
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
