import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://docs.astro.build/en/guides/server-side-rendering/
import nodejs from '@astrojs/node';
import node from "@astrojs/node";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), sitemap(), tailwind()],
  site: 'https://example.com',
  adapter: node({
    mode: "standalone"
  }),
  output: 'hybrid'
});