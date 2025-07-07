import { Sessions } from '@/db/index.server'
import { Cookies } from '@/lib/backend/cookies'
import { completeSignInChallenge } from '@/lib/webauthn/signIn'
import { consoleTag } from '@/utils/tagTime'
import type { APIRoute } from 'astro'

const print = consoleTag('webauthn')

export const prerender = false

export const POST: APIRoute = async ({ request, cookies, locals, redirect }) => {
  try {
    const { credential } = await request.json()

    const user = await completeSignInChallenge(credential)

    if (!user || !user.id) throw new Error('Failed to load user for challenge')

    const session = Sessions.create(user.id)

    Cookies.setSessionCookie(cookies, session.token)

    locals.isLoggedIn = true
    locals.user = user

    print('completed sign-in, redirecting to admin home')

    return redirect('/admin/', 302)
  } catch (e) {
    print('error completing sign-in:', e)
    return Response.json(e, { status: 500 })
  }
}
