
export type GitHubAccessToken = {
  access_token: string,
  token_type: string,
  scope: string,
}

export type GitHubAccessTokenError = {
  error: string,
  error_description: string,
  error_uri: string,
}

export type GitHubAccessTokenResponse = Promise<
  GitHubAccessToken | GitHubAccessTokenError
>

export async function exchangeCodeForAccessToken(code: string): GitHubAccessTokenResponse {
  const GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token"
  const GITHUB_CLIENT_SECRET = import.meta.env.GITHUB_CLIENT_SECRET
  const GITHUB_CLIENT_ID = import.meta.env.GITHUB_CLIENT_ID
  const response = await fetch(GITHUB_ACCESS_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      // redirect_uri: 'redirect_uri',
      code,
    })
  })
  return response.json()
}