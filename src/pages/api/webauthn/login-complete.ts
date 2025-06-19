import { loginComplete } from '@/lib/webauthn/register'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async (ctx) => {
  const { username, credential } = await ctx.request.json()

  const user = loginComplete({ username, credential })

  ctx.cookies.set('admin-session', username, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return Response.json({ success: true })
}
