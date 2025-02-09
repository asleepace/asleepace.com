import chalk from 'chalk';

const ENVIRONMENT = process.env.ENVIRONMENT;
const MONGODB_URI = process.env.MONGODB_URI;
console.assert(ENVIRONMENT, "ASSERT_ENVIRONMENT is not set!");
console.assert(MONGODB_URI, "ASSERT_MONGODB_URI is not set!");
console.log(
  chalk.white("\n+" + "-".repeat(60) + "--[ configuration ]----+\n")
);
const DEFAULT_CONFIGURATIONS = {
  production: {
    host: "asleepace.com",
    http: "https",
    port: 4321
  },
  development: {
    host: "localhost",
    http: "http",
    port: 4321
  }
};
const baseUrl = ENVIRONMENT === "production" ? new URL("https://asleepace.com") : new URL("http://localhost:4321");
const siteConfig = {
  ...DEFAULT_CONFIGURATIONS[ENVIRONMENT],
  environment: ENVIRONMENT,
  isDebug: ENVIRONMENT === "development",
  mongodbUri: MONGODB_URI,
  sqliteUri: "db.sqlite",
  baseUrl,
  /** NOTE: must have preceding dot (.) for cookies */
  cookieDomain: `.${baseUrl.hostname}`,
  /** NOTE: used when creating and deleting cookies */
  cookiePath: "/"
};
Object.entries(siteConfig).forEach(([key, value]) => {
  const tag = chalk.gray(`>>  [${key}]`);
  if (value instanceof URL) {
    console.log(tag, chalk.cyan(value.toString()));
  } else if (typeof value === "string") {
    console.log(tag, `"${value}"`);
  } else {
    console.log(tag, value);
  }
});
const SITE_TITLE = "Asleepace";
const SITE_DESCRIPTION = "a random collection of internet treasures";
const SITE_URL = "https://asleepace.com";
const COOKIE_PATH = "/";
const siteData = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  showcaseLinks: [
    "https://soladex.co",
    "https://consoledump.io",
    "https://polyblog.net",
    "https://patrick-teahan.com",
    "https://lams-kitchen.com",
    "https://stockindx.com"
  ]
};
const PATH = {
  ADMIN_LOGIN(searchParams = {}) {
    const query = new URLSearchParams(searchParams);
    const hasParams = Object.keys(searchParams).length > 0;
    const queryString = hasParams ? `?${query.toString()}` : "";
    return "/admin/login" + queryString;
  },
  ADMIN_LOGOUT: "/admin/logout",
  ADMIN_HOME: "/admin",
  ADMIN_SYSTEM: "/admin/system",
  ADMIN_ANALYTICS: "/admin/analytics",
  CODE_EDITOR: "/code",
  CLEAR_SESSION: "/api/auth/clearSession"
};
console.log("\n");

export { COOKIE_PATH as C, PATH as P, SITE_TITLE as S, siteConfig as a, SITE_DESCRIPTION as b, siteData as s };
