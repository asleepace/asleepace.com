import chalk from 'chalk'
import packageJson from '../package.json'
import { consoleTag } from './utils/tagTime'

const print = consoleTag('config', chalk.magenta)

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

const ENVIRONMENT = (process.env.NODE_ENV ?? 'development') as SiteEnvironment
const MONGODB_URI = process.env.MONGODB_URI as string

console.assert(MONGODB_URI, 'warning: MONGODB_URI (.env) is not set!')

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

const baseUrl = ENVIRONMENT === 'production' ? new URL('https://asleepace.com') : new URL('http://localhost:4321')

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
  themeColor: '#ffbf00',
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
  if (key === 'hashTagColors') return
  if (key === 'path') return
  if (value instanceof URL) {
    print(chalk.gray(`${key}:`), chalk.cyan(value.toString()))
  } else if (typeof value === 'string') {
    print(chalk.gray(`${key}:`), chalk.green(`"${value}"`))
  } else {
    print(chalk.gray(`${key}:`), value)
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
