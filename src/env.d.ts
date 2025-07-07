/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import { type CollectionEntry } from 'astro:content'
import type { User, Metric } from './db/index.server'

export type PageMetrics = Metric

interface Env {
  DATABASE_URL: string
  SMTP_HOST: string
  SMTP_PORT: number
  SMTP_USER: string
  SMTP_PASSWORD: string
  SMTP_FROM: string
  MONGODB_URI: string
  HOST: string
  PORT: number
  PROTOCOL: string
  COOKIE_DOMAIN: string
  WEBAUTHN_RP_ID: string
  WEBAUTHN_RP_ORIGIN: string
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
