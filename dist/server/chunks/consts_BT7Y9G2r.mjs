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

export { COOKIE_PATH as C, PATH as P, SITE_TITLE as S, SITE_DESCRIPTION as a, siteData as s };
