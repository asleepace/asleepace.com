/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Env {
  DATABASE_URL: string
  SECRET: string
  SMTP_HOST: string
  SMTP_PORT: number
  SMTP_USER: string
  SMTP_PASSWORD: string
  SMTP_FROM: string
  GITHUB_CLIENT_SECRET: string
  GITHUB_CLIENT_ID: string
  MONGODB_URI: string
}
