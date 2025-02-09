// @ts-check
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import react from '@astrojs/react'
import node from '@astrojs/node'
import mdx from '@astrojs/mdx'

/**
 *  ## AstroConfiguration
 *
 *  Main site configuration.
 *
 *  @see https://astro.build/config for more information
 *  @see https://docs.astro.build/en/recipes/bun/ for astro with bun
 *  @see https://docs.astro.build/en/guides/server-side-rendering/ for SSR
 *  @see https://lucia-auth.com/sessions/cookies/astro for cookies
 */

export default defineConfig({
  site: 'https://asleepace.com',
  integrations: [mdx(), sitemap(), react(), tailwind()],
  adapter: node({
    mode: 'standalone',
  }),
  security: {
    checkOrigin: false, // CORS
  },
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  },
})
