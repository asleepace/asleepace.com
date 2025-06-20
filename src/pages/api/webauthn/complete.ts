import { siteConfig } from '@/consts'
import { Sessions } from '@/db'
import { checkRandomChallenge, getRandomChallenge } from '@/lib/webauthn/register'
import type { APIRoute } from 'astro'

export const prerender = false

const parseBase64 = (base64: string) => {
  return Buffer.from(base64, 'base64url').toString('utf-8')
}

const parseBase64JSON = (base64: string) => {
  return JSON.parse(Buffer.from(base64, 'base64url').toString('utf-8'))
}

const environment = process.env.ENVIRONMENT
const isDevelopment = Boolean(environment === 'development')
const isProduction = !isDevelopment
const cookieDomain = isDevelopment ? 'localhost' : process.env.COOKIE_DOMAIN

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30

//  WebAuthN: Sign In Complete
//
//
//
export const POST: APIRoute = async ({ request, cookies, locals, redirect }) => {
  console.log('[WebAuthN] signIn complete called!')

  const { credential } = await request.json()
  console.log('[WebAuthN] credential:', credential)

  const user = checkRandomChallenge(credential)

  if (!user) throw new Error('Failed to load user for challenge')

  const session = Sessions.create(user.id)
  const sessionToken = session.token

  const cookieOptions = {
    /** where the cookie is valid (must match to delete) */
    path: siteConfig.cookiePath,
    /** the domain that the cookie is valid for */
    domain: cookieDomain,
    /** javascript cannot access the cookie */
    httpOnly: true,
    /** if the cookie is only accessible via https */
    secure: isProduction,
    /** if the cookie is only accessible via the same site */
    sameSite: 'lax',
    /** the expiration date of the cookie */
    expires: new Date(Date.now() + THIRTY_DAYS), // 30 days
  } as const

  cookies.set('session', sessionToken, cookieOptions) // set the cookie
  locals.isLoggedIn = true
  locals.user = user

  console.log('[auth] setting cookie:', cookieOptions)

  return redirect(siteConfig.path.adminHome, 302)
}
