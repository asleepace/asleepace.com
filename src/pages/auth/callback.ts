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

export const get: Oauth2CallbackRoute = async (context) => {

  const { url, request, props, redirect, params } = context
  const accessCode = url.searchParams.get('code')
  const scope = url.searchParams.get('scope')

  console.log('[auth/callback.ts] accessCode:', accessCode)
  console.log('[auth/callback.ts] scope:', scope)

  if (!accessCode) return new Response('access_code not found', { status: 500 })

  const response = await exchangeCodeForAccessToken(accessCode)

  if ('error' in response) return new Response(JSON.stringify(response), {
    status: 500,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  })

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  })
}