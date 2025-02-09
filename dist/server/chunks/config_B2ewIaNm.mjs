console.assert(Bun.env.IS_DEV, "[http] Missing env var: IS_DEV");
console.assert(Bun.env.PROTOCOL, "[http] Missing env var: PROTOCOL");
console.assert(Bun.env.HOST, "[http] Missing env var: HOST");
console.assert(Bun.env.PORT, "[http] Missing env var: PORT");
const isDev = Boolean(Bun.env.IS_DEV);
const protocol = String(Bun.env.PROTOCOL);
const scheme = String(`${protocol}://`);
const host = String(Bun.env.HOST);
const port = Number(Bun.env.PORT);
const baseUrl = isDev ? new URL(`${scheme}${host}:${port}`) : new URL(`${scheme}${host}`);
const config = {
  protocol,
  scheme,
  host,
  port,
  isDev,
  baseUrl
};

export { config as c };
