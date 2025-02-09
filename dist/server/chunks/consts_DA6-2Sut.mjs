const SITE_TITLE = "Asleepace";
const SITE_DESCRIPTION = "a random collection of internet treasures";
const SITE_URL = "https://asleepace.com";
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
    return "/admin/login" + query.toString();
  },
  ADMIN_LOGOUT: "/admin/logout",
  ADMIN_HOME: "/admin",
  ADMIN_SYSTEM: "/admin/system",
  ADMIN_ANALYTICS: "/admin/analytics",
  CODE_EDITOR: "/code"
};

export { PATH as P, SITE_TITLE as S, SITE_DESCRIPTION as a, siteData as s };
