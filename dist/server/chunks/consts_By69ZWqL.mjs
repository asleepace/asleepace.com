import chalk from 'chalk';

const name = "asleepace.com";
const description = "a collection of me by me.";
const license = "MIT";
const type = "module";
const version = "1.4.0";
const scripts = {"check":"bun --bun astro check","dev":"bunx --bun astro dev","start":"bunx --bun astro build --port 4321 && bunx --bun astro preview --port 4321","build":"bunx --bun astro build","build:debug":"DEBUG=astro:*,vite:* bunx --bun astro build --verbose","preview":"bunx --bun astro preview","build:tailwind":"npx tailwindcss -i ./src/styles/global.css -o ./src/styles/output.css","watch:tailwind":"npx tailwindcss -i ./src/styles/global.css -o ./src/styles/output.css --watch","deploy":"./scripts/deploy.sh","astro":"bunx --bun astro","util:upgrade":"bun upgrade","util:check":"bunx --bun astro check","run:server":"bun ./dist/server/entry.mjs","logs":"pm2 logs","logs:recent":"pm2 logs --last 200","logs:system":"sudo tail -f /var/log/syslog","logs:asleepace":"pm2 logs asleepace.com","logs:stockindx":"pm2 logs stockindx.com","logs:nginx":"sudo tail -f /var/log/nginx/error.log","logs:nginx:access":"sudo tail -f /var/log/nginx/access.log","logs:ufw":"sudo journalctl -u ufw","logs:postfix":"sudo tail -f /var/log/mail.log","logs:errors":"sudo journalctl -u errors","memory":"df -h","storage":"df -h","disk":"ncdu /","free":"free -h"};
const dependencies = {"@astrojs/check":"^0.9.4","@astrojs/mdx":"4.0.3","@astrojs/node":"9.0.0","@astrojs/react":"4.1.2","@astrojs/rss":"4.0.10","@astrojs/sitemap":"3.2.1","@astrojs/tailwind":"5.1.4","@nanostores/react":"^0.8.4","@types/react":"^19.0.4","@types/react-dom":"^19.0.2","astro":"5.1.1","chalk":"^5.4.1","clsx":"^2.1.1","highlight.js":"^11.11.1","lucide-react":"^0.469.0","react":"^19.0.0","react-dom":"^19.0.0","tailwindcss":"^3.4.17","typescript":"^5.5.3"};
const devDependencies = {"@types/bun":"^1.1.14"};
const packageJson = {
  name,
  description,
  license,
  type,
  version,
  scripts,
  dependencies,
  devDependencies,
};

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
  version: packageJson.version,
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
