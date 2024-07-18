import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://docs.astro.build/en/guides/server-side-rendering/
import nodejs from '@astrojs/node';

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), sitemap()],
  prefetch: true,
  site: 'https://asleepace.com',
  adapter: node({
    mode: "standalone"
  }),
  output: 'hybrid'
});