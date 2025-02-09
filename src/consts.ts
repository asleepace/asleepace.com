// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Asleepace'
export const SITE_DESCRIPTION = 'a random collection of internet treasures'
export const SITE_URL = 'https://asleepace.com'

export const COOKIE_PATH = '/'

export const siteData = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  showcaseLinks: [
    'https://soladex.co',
    'https://consoledump.io',
    'https://polyblog.net',
    'https://patrick-teahan.com',
    'https://lams-kitchen.com',
    'https://stockindx.com',
  ],
}

/**
 * Routes for common site paths.
 */
export const PATH = {
  ADMIN_LOGIN(searchParams: Record<string, string> = {}) {
    const query = new URLSearchParams(searchParams)
    const hasParams = Object.keys(searchParams).length > 0
    const queryString = hasParams ? `?${query.toString()}` : ''
    return '/admin/login' + queryString
  },
  ADMIN_LOGOUT: '/admin/logout',
  ADMIN_HOME: '/admin',
  ADMIN_SYSTEM: '/admin/system',
  ADMIN_ANALYTICS: '/admin/analytics',
  CODE_EDITOR: '/code',
  CLEAR_SESSION: '/api/auth/clearSession',
}
