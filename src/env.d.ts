/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import { type CollectionEntry } from 'astro:content'
import type { User } from './db/types'

export type PageMetrics = {
  views: number
  likes: number
  comments: unknown
  createdAt: Date
  updatedAt: Date
}

// declare global {
//   type ToString = { toString(): string }
//   type Blog = CollectionEntry<'blog'>
// }

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
  HOST: string
  PORT: number
  PROTOCOL: string
  ENVIRONMENT: 'development' | 'production'
  COOKIE_DOMAIN: string
  WEBAUTHN_RP_ID: string
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
