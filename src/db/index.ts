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
import crypto from "crypto"
import bcrypt from "bcryptjs"

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

const arrayOfTokenScopes = ({ scope = [] }: Token | AuthorizationCode): Prisma.InputJsonValue => Array.isArray(scope) ? scope : [scope]

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
  const scopes = arrayOfTokenScopes(code)
  const data: Prisma.OauthAccessGrantCreateArgs['data'] = {
    application: { connect: { id: client.id } },
    user: { connect: { id: user.id } },
    token: code.authorizationCode,
    expiresAt: code.expiresAt,
    createdAt: new Date().toISOString(),
    redirectUri: code.redirectUri,
    scopes
  }
  const codeChallenge = code.codeChallenge ?? data.codeChallenge
  const codeChallengeMethod = code.codeChallengeMethod ?? data.codeChallengeMethod
  await prisma.oauthAccessGrant.create({
    data,
  })
  const result: AuthorizationCode = code
  return ({ ...result, client, user, codeChallenge, codeChallengeMethod })
}


const revokeAuthorizationCode = async ({ code }: AuthorizationCode): Oauth2RevokeAuthorizationCodeResponse => {
  if (!code) return false
  const accessGrant = await prisma.oauthAccessGrant.findUnique({
    where: { token: code },
  })
  if (!accessGrant) return false
  await prisma.oauthAccessGrant.delete({
    where: { id: accessGrant.id },
  })
  return true
}

// clientSecret can be undefined when grant type does not require client secret
const getClient = async (clientId: string, clientSecret?: string): Promise<Client | Falsey> => {
  if (!clientId) return
  const application = await prisma.oauthApplication.findUnique({
    where: { clientId },
  })

  if (!application) return false
  if (clientSecret && application.clientSecret.length !== clientSecret.length) return false
  if (clientSecret && !crypto.timingSafeEqual(
    Buffer.from(application.clientSecret),
    Buffer.from(clientSecret),
  )
  ) return false;

  return {
    id: application.id,
    grants: application.grants as string[],
    redirectUris: application.redirectUris as string[],
    scopes: application.scopes as string[],
  }
}

const getUser = async (username: string, password: string) => {
  if (!username || !password) return false
  const user = await prisma.user.findUnique({
    where: { email: username.toLowerCase() },
  })
  if (!user) return false
  if (!user.encryptedPassword) return false
  const isValidPassword = await bcrypt.compare(
    password,
    user.encryptedPassword,
  )
  return isValidPassword ? user : false
}

const verifyScope = async (token: Token, scope: string | string[]): Promise<boolean> => {
  return true
}

const validateScope = async (
  user: User,
  client: Client,
  scope: string | string[],
) => {
  if (client.scopes === undefined) return []
  if (!client.scopes.length) return client.scopes
  if (!client.scopes.includes(scope)) return false
  return client.scopes
};


// oauth2-server model
export const model: Oauth2ServerModel = {
  getUser,
  getClient,

  saveToken,
  revokeToken,

  getAccessToken,
  getRefreshToken,

  getAuthorizationCode,
  saveAuthorizationCode,
  revokeAuthorizationCode,

  verifyScope,
  validateScope,
}

// oauth2-server instance
export const oauth = new OAuth2Server({ model })