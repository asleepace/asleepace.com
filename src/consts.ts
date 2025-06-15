// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.
import chalk from 'chalk'
import packageJson from '../package.json'

export type SiteCookieDomain = `.${string}` // example: ".asleepace.com"
export type SiteCookiePath = `/${string}` // example: "/"
export type SiteEnvironment = 'production' | 'development'

export type SiteConfig = {
  baseUrl: URL
  environment: SiteEnvironment
  isDebug: boolean
  cookieDomain: SiteCookieDomain
  cookiePath: SiteCookiePath
  mongodbUri: string
  sqliteUri: string
  version: string
  themeColor: string
  coverImage: string
  readonly path: {
    adminLogin(searchParams: Record<string, string>): string
    adminLogout: '/admin/logout'
    adminHome: '/admin'
    adminSystem: '/admin/system'
    adminAnalytics: '/admin/analytics'
    codeEditor: '/code'
    clearSession: '/api/auth/clearSession'
  }
  hashTagColors: Record<string, string>
}

// --- check environment variables ---

const ENVIRONMENT = process.env.ENVIRONMENT as SiteEnvironment
const MONGODB_URI = process.env.MONGODB_URI as string

console.assert(ENVIRONMENT, 'ASSERT_ENVIRONMENT is not set!')
console.assert(MONGODB_URI, 'ASSERT_MONGODB_URI is not set!')
console.log(
  chalk.white('\n+' + '-'.repeat(60) + '--[ configuration ]' + '----+\n')
)

const DEFAULT_CONFIGURATIONS = {
  production: {
    host: 'asleepace.com',
    http: 'https',
    port: 4321,
  },
  development: {
    host: 'localhost',
    http: 'http',
    port: 4321,
  },
} as const

const baseUrl =
  ENVIRONMENT === 'production'
    ? new URL('https://asleepace.com')
    : new URL('http://localhost:4321')

// --- create config ---

export const siteConfig: SiteConfig = {
  ...DEFAULT_CONFIGURATIONS[ENVIRONMENT],
  environment: ENVIRONMENT,
  isDebug: ENVIRONMENT === 'development',
  mongodbUri: MONGODB_URI,
  sqliteUri: 'db.sqlite',
  version: packageJson.version,
  baseUrl,
  /** NOTE: must have preceding dot (.) for cookies */
  cookieDomain: `.${baseUrl.hostname}` as const,
  /** NOTE: used when creating and deleting cookies */
  cookiePath: '/',
  /** Extended theme styling */
  themeColor: 'oklch(82.8% 0.189 84.429)',
  /** default cover photo */
  coverImage: '/images/about-me.jpeg',
  /** paths */
  path: {
    adminLogin(searchParams: Record<string, string> = {}) {
      const query = new URLSearchParams(searchParams)
      const hasParams = Object.keys(searchParams).length > 0
      const queryString = hasParams ? `?${query.toString()}` : ''
      return '/admin/login' + queryString
    },
    adminLogout: '/admin/logout',
    adminHome: '/admin',
    adminSystem: '/admin/system',
    adminAnalytics: '/admin/analytics',
    codeEditor: '/code',
    clearSession: '/api/auth/clearSession',
  },
  hashTagColors: {
    technical: 'bg-indigo-500',
    typescript: 'bg-blue-500',
    algorithm: 'bg-yellow-500',
    investing: 'bg-teal-500',
    finance: 'bg-green-500',
    stocks: 'bg-emerald-500',
    snippets: 'bg-orange-400',
    npm: 'bg-red-400',
    bash: 'bg-green-500',
    default: 'bg-slate-500',
  },
}

Object.entries(siteConfig).forEach(([key, value]) => {
  const tag = chalk.gray(`>>  [${key}]`)
  if (value instanceof URL) {
    console.log(tag, chalk.cyan(value.toString()))
  } else if (typeof value === 'string') {
    console.log(tag, `"${value}"`)
  } else {
    console.log(tag, value)
  }
})

export const SITE_TITLE = 'Asleepace'
export const SITE_DESCRIPTION = 'a random collection of internet treasures'
export const SITE_URL = 'https://asleepace.com'

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
