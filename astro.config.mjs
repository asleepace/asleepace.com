import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import node from '@astrojs/node';
// import mdx from '@astrojs/mdx';

/**
 *  Site-map Configuration
 *
 *  https://docs.astro.build/en/guides/integrations-guide/sitemap/
 */
import tailwind from "@astrojs/tailwind";
const sitemapConfig = sitemap({
  changefreq: 'weekly',
  lastmod: new Date(),
  priority: 0.7
});

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
  integrations: [/*mdx(),*/ sitemapConfig, react(), tailwind()],
  prefetch: true,
  site: 'https://asleepace.com',
  adapter: node({
    mode: 'standalone'
  }),
  // output: 'server',
  // output: 'hybrid'
  legacy: {
    collections: true,
  }
});