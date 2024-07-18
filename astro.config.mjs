import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'

// https://docs.astro.build/en/guides/server-side-rendering/
import node from '@astrojs/node'
import react from '@astrojs/react'

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), sitemap(), react()],
  prefetch: true,
  site: 'https://asleepace.com',
  adapter: node({
    mode: 'standalone',
  }),
  output: 'hybrid',
})
