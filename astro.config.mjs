// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import react from '@astrojs/react'
import node from '@astrojs/node'
import mdx from '@astrojs/mdx'

import tailwindcss from '@tailwindcss/vite'

import db from '@astrojs/db'

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
  output: 'server',
  site: 'https://asleepace.com',
  integrations: [
    mdx({
      optimize: {
        // NOTE: Ignore custom components:
        // https://docs.astro.build/en/guides/integrations-guide/mdx/#optimize
        ignoreElementNames: ['StockChart', 'pre', 'code'],
      },
      extendMarkdownConfig: false,
      syntaxHighlight: 'shiki',
      shikiConfig: {
        theme: 'dracula',
        wrap: true,
      },
    }),
    sitemap(),
    react(),
    db(),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        // ignore these files when bundling...
        external: [/highlight\.js\/styles\/.+\.css$/, /typescript\.js/],
      },
    },
  },
  adapter: node({
    mode: 'standalone',
  }),
  security: {
    checkOrigin: false, // CORS
  },
  server: {},
})
