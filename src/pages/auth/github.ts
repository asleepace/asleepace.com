import type { APIRoute } from 'astro'
import process from 'process'

export const prerender = false;

export type GitHubAPIRoute = APIRoute
export type GitHubScope = 'repo' | 'user'
export type GitHubRedirectUri = string

export const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize'
export const GITHUB_CALLBACK_URL = 'http://localhost:3000/auth/callback'

export const get: GitHubAPIRoute = async (context) => {
  console.log('[auth/github.ts] GitHub Oauth2 flow starting...')
  const { request, props, redirect, params } = context
  const { body, credentials, headers, formData } = request
  const clientId = import.meta.env.GITHUB_CLIENT_ID
  if (!clientId) return new Response('GITHUB_CLIENT_ID not found', { status: 500 })
  const redirectUri: GitHubRedirectUri = GITHUB_CALLBACK_URL
  const scope: GitHubScope = 'user'
  const oauth2Flow = new URL(GITHUB_OAUTH_URL)
  oauth2Flow.searchParams.append('client_id', clientId)
  oauth2Flow.searchParams.append('redirect_uri', redirectUri)
  oauth2Flow.searchParams.append('scope', scope)
  const githubOauth2Url = oauth2Flow.toString()
  console.log('[github.ts] githubOauth2Url:', githubOauth2Url)
  return redirect(githubOauth2Url)
}