import type { APIRoute } from 'astro'
import process from 'process'

export const prerender = false;

export type GitHubAPIRoute = APIRoute
export type GitHubScope = 'repo' | 'user'
export type GitHubRedirectUri = string

export const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize'
export const GITHUB_CALLBACK_URL = 'https://asleepace.com/auth/callback'
const GITHUB_CLIENT_ID = import.meta.env.GITHUB_CLIENT_ID

export const get: GitHubAPIRoute = async ({ redirect }) => {
  console.log('[auth/github.ts] GitHub Oauth2 flow starting...')
  if (!GITHUB_CLIENT_ID) return new Response('GITHUB_CLIENT_ID not found', { status: 500 })
  const redirectUri: GitHubRedirectUri = GITHUB_CALLBACK_URL
  const scope: GitHubScope = 'user'
  const oauth2Flow = new URL(GITHUB_OAUTH_URL)
  oauth2Flow.searchParams.append('client_id', GITHUB_CLIENT_ID)
  // oauth2Flow.searchParams.append('redirect_uri', redirectUri)
  oauth2Flow.searchParams.append('scope', scope)
  const githubOauth2Url = oauth2Flow.toString()
  console.log('[github.ts] githubOauth2Url:', githubOauth2Url)
  return redirect(githubOauth2Url)
}