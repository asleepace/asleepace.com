import { PrismaClient, OauthAccessToken, OauthApplication, Prisma } from "@prisma/client"
import { OAuth2Server } from "oauth2-server"
import type {
  User,
  Token,
  Client,
  RefreshToken,
  ServerOptions,
  PasswordModel,
  AuthorizationCode,
  RefreshTokenModel,
  AuthorizationCodeModel,
  ClientCredentialsModel,
  ExtensionModel,
  Falsey
} from "oauth2-server"

// oauth2-server types

export type Oauth2ServerModel = AuthorizationCodeModel
  | ClientCredentialsModel
  | RefreshTokenModel
  | PasswordModel
  | ExtensionModel;

export type PrismaRefreshToken = OauthAccessToken & OauthApplication

export type Oauth2AccessTokenResponse = Promise<Token | Falsey>
export type Oauth2RefreshTokenResponse = Promise<RefreshTokenModel | Falsey>
export type Oauth2AuthorizationCodeResponse = Promise<AuthorizationCode | Falsey>
export type Oauth2RevokeTokenResponse = Promise<boolean>
export type Oauth2SaveTokenResponse = Promise<Token>
export type Oauth2SaveAuthorizationCodeResponse = Promise<AuthorizationCode | Falsey>
export type Oauth2RevokeAuthorizationCodeResponse = Promise<boolean>

// prisma client integration

export const prisma = new PrismaClient()


const isTokenExpired = (expiration: Date | Falsey): boolean => Boolean(expiration && expiration < new Date())

const arrayOfTokenScopes = ({ scope = [] }: Token): Prisma.InputJsonValue => Array.isArray(scope) ? scope : [scope]

/** * * oauth2 methods * * */

const getAccessToken = async (token: string): Oauth2AccessTokenResponse => {
  const result = await prisma.oauthAccessToken.findUnique({
    where: { token }
  })
  if (!result) return false

  const accessToken = {
    accessToken: result.token,
    accessTokenExpiresAt: result.tokenExpiresAt ?? undefined,
    refreshToken: result.refreshToken ?? undefined,
    refreshTokenExpiresAt: result.refreshTokenExpiresAt ?? undefined,
    client: {
      id: result.applicationId,
      grants: [],
    },
    user: {
      id: result.userId,
    },
  }

  if (isTokenExpired(accessToken.accessTokenExpiresAt)) {
    await revokeToken(accessToken)
    return false
  }

  return accessToken
}


const getRefreshToken = async (refreshToken: string) => {
  const token = await prisma.oauthAccessToken.findUnique({
    where: { refreshToken },
    include: { application: true },
  });

  if (!token) return false
  if (!token.refreshToken) return false

  const newRefreshToken = {
    token: token.token,
    refreshToken: token.refreshToken,
    client: {
      id: token.applicationId as string,
      grants: token.application.grants as string[],
      redirectUris: token.application.redirectUris as string[]
    },
    user: {
      id: token.userId,
    },
  }

  if (isTokenExpired(token.refreshTokenExpiresAt)) {
    await revokeToken(newRefreshToken)
    return false
  }

  return newRefreshToken
}


const saveToken = async (token: Token, client: Client, user: User): Oauth2SaveTokenResponse => {
  const scopes = arrayOfTokenScopes(token)
  await prisma.oauthAccessToken.create({
    data: {
      application: { connect: { id: client.id } },
      user: { connect: { id: user.id } },
      token: token.accessToken,
      refreshToken: token.refreshToken,
      tokenExpiresAt: token.accessTokenExpiresAt,
      createdAt: new Date().toISOString(),
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      scopes,
    },
  })

  return ({ ...token, client, user })
}

const revokeToken = async ({ token }: Token | RefreshToken): Oauth2RevokeTokenResponse => {
  const accessToken = await prisma.oauthAccessToken.findUnique({
    where: { token },
  })
  if (!accessToken) return false
  const result = await prisma.oauthAccessToken.delete({
    where: { id: accessToken.id },
  })
  return !!result
}

const getAuthorizationCode = async (code: string): Oauth2AuthorizationCodeResponse => {
  const accessGrant = await prisma.oauthAccessGrant.findUnique({
    where: { token: code },
    include: { user: true, application: true },
  });

  if (!accessGrant) return false

  const [scope] = accessGrant.scopes as string[]
  const grants = accessGrant.application.grants as string[]
  const result: AuthorizationCode = {
    code: accessGrant.token,
    authorizationCode: accessGrant.token,
    expiresAt: accessGrant.expiresAt,
    scope,
    redirectUri: accessGrant.redirectUri,
    client: {
      id: accessGrant.applicationId,
      grants,
    },
    user: accessGrant.user,
  };

  const codeChallenge = accessGrant.codeChallenge ?? result.codeChallenge
  const codeChallengeMethod = accessGrant.codeChallengeMethod ?? result.codeChallengeMethod

  if (isTokenExpired(accessGrant.expiresAt)) {
    await revokeAuthorizationCode(result)
    return false
  }

  return ({ ...result, codeChallenge, codeChallengeMethod })
}

const saveAuthorizationCode = async (
  code: AuthorizationCode,
  client: Client,
  user: User,
): Oauth2SaveAuthorizationCodeResponse => {
  return false
}

const revokeAuthorizationCode = async ({ code }: AuthorizationCode): Oauth2RevokeAuthorizationCodeResponse => {
  return false
}

const getClient = async (clientId: string, clientSecret: string): Promise<Client | Falsey> => {
  return false
}

const verifyScope = async (token: Token, scope: string | string[]): Promise<boolean> => {
  return false
}


// oauth2-server model
export const model: Oauth2ServerModel = {
  getClient,
  verifyScope,
  getAccessToken,
  getRefreshToken,
  saveToken,
  revokeToken,
  getAuthorizationCode,
  saveAuthorizationCode,
  revokeAuthorizationCode,
}

// oauth2-server instance
export const oauth = new OAuth2Server({ model })