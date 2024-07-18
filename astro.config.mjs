import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import react from '@astrojs/react'
import node from '@astrojs/node'
import mdx from '@astrojs/mdx'

/**
 *  Astro Configuration
 *
 *  This is the where the typescript application is configured.
 *
 *  - https://astro.build/config
 *  - https://docs.astro.build/en/recipes/bun/
 *  - https://docs.astro.build/en/guides/server-side-rendering/
 */

export default defineConfig({
  integrations: [mdx(), sitemap(), react()],
  prefetch: true,
  site: 'https://asleepace.com',
  adapter: node({
    mode: 'standalone',
  }),
  output: 'hybrid',
})
