// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import react from '@astrojs/react'
import node from '@astrojs/node'
import mdx from '@astrojs/mdx'

import tailwindcss from '@tailwindcss/vite'

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
  integrations: [mdx({
    optimize: {
      // NOTE: Ignore custom components:
      // https://docs.astro.build/en/guides/integrations-guide/mdx/#optimize
      ignoreElementNames: ['StockChart', 'pre', 'code']
    },
    extendMarkdownConfig: true,
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'dracula',
      wrap: true
    },
  }), sitemap(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: node({
    mode: 'standalone',
  }),
  security: {
    checkOrigin: false, // CORS
  },
  markdown: {
    syntaxHighlight: 'shiki',
    gfm: true
  },
  server: {
    // NOTE: These don't appear to work, see CORS middleware instead
    // headers: {
    //   'Access-Control-Allow-Origin': '*',
    //   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
    //   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    //   'Access-Control-Allow-Credentials': 'true',
    // },
  },
})
