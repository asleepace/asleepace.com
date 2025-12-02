/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import { type CollectionEntry } from 'astro:content'
import type { User, Metric } from './db'

export type PageMetrics = Metric

interface ImportMetaEnv {
  // Postgres
  POSTGRES_CONNECTION_STRING: string
  POSTGRES_PASSWORD: string
  POSTGRES_USERNAME: string
  POSTGRES_DATABASE: string
  POSTGRES_HOST: string
  POSTGRES_PORT: string
  // Mongo (deprecated)
  MONGODB_URI: string
  // SMTP
  SMTP_HOST: string
  SMTP_PORT: string
  SMTP_USER: string
  SMTP_PASSWORD: string
  SMTP_FROM: string
  // API Keys
  GROK_API_KEY: string
  // System
  CHROME_EXECUTABLE_PATH: string
  CHROME_COOKIE_REDDIT: string
  // WebAuthN
  WEBAUTHN_RP_ID: string
  WEBAUTHN_RP_ORIGIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  type ToString = { toString(): string }
  type Blog = CollectionEntry<'blog'>

  namespace App {
    export interface Locals {
      isLoggedIn: boolean
      user: User | undefined
      requestId: number
    }
  }
}

export {}
