/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import { type CollectionEntry } from 'astro:content'
import type { User, Metric } from './db'

export type PageMetrics = Metric

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
