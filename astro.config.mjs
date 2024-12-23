// @ts-check
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import react from '@astrojs/react'
import node from '@astrojs/node'
import mdx from '@astrojs/mdx'

/**
 *  Site-map Configuration
 *
 *  https://docs.astro.build/en/guides/integrations-guide/sitemap/
 */

// const sitemapConfig = sitemap({
//   changefreq: 'weekly',
//   lastmod: new Date(),
//   priority: 0.7,
// })

/**
 *  Astro Configuration
 *
 *  This is the where the typescript application is configured.
 *
 *  - https://astro.build/config
 *  - https://docs.astro.build/en/recipes/bun/
 *  - https://docs.astro.build/en/guides/server-side-rendering/
 */

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), sitemap(), react(), tailwind()],
  site: 'https://asleepace.com',
  // output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
})
