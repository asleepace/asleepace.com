import type { APIRoute } from 'astro'
import { exchangeCodeForAccessToken } from '../../modules/github'

// example
// http://asleepace.com:3000/auth/callback?code=ba6d7febf3e571a0e7e6

// response: {
//  "access_token": "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",
//  "token_type": "bearer",
//  "scope": "read:user"
// }

export const prerender = false;

export type Oauth2CallbackRoute = APIRoute

export const get: Oauth2CallbackRoute = async ({ url, cookies, redirect }) => {

  const accessCode = url.searchParams.get('code')
  const scope = url.searchParams.get('scope')

  if (!accessCode) return new Response('code not found', { status: 500 })

  const response = await exchangeCodeForAccessToken(accessCode)

  if ('error' in response) return new Response(JSON.stringify(response), {
    status: 500,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  })

  // set astro cookie
  console.log('[auth/callback.ts] setting cookie:', response.access_token)
  cookies.set('cookie', { accessToken: response.access_token }, {
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  if (cookies.has('cookie')) {
    console.log('[auth/callback.ts] cookie set!')
  } else {
    console.log('[auth/callback.ts] cookie not set!')
  }


  return redirect('/profile')
}