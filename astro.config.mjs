// @ts-check
import { defineConfig, envField } from 'astro/config'
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
 *  @see https://docs.astro.build/en/guides/environment-variables/ for environment variables
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
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['bun:sqlite', 'lucide-react'],
      include: ['react', 'react-dom']
    },
    ssr: {
      external: ['bun:sqlite']
    },
    build: {
      rollupOptions: {
        // ignore these files when bundling...
        external: [/highlight\.js\/styles\/.+\.css$/, /typescript\.js/, /@\/db\/.*/],
      },
    },
  },
  adapter: node({
    mode: 'standalone',
  }),
  security: {
    checkOrigin: true, // CORS
  },
  server: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : '0.0.0.0',
    port: parseInt(process.env.PORT || '4321'),
    allowedHosts: ['asleepace.com', 'localhost', '127.0.0.1']
  },
  devToolbar: {
    enabled: false,
  },
  env: {
    schema: {
      // Postgres (all server secrets)
      POSTGRES_CONNECTION_STRING: envField.string({ 
        context: 'server', 
        access: 'secret' 
      }),
      POSTGRES_PASSWORD: envField.string({ 
        context: 'server', 
        access: 'secret' 
      }),
      POSTGRES_USERNAME: envField.string({ 
        context: 'server', 
        access: 'secret' 
      }),
      POSTGRES_DATABASE: envField.string({ 
        context: 'server', 
        access: 'secret' 
      }),
      POSTGRES_HOST: envField.string({ 
        context: 'server', 
        access: 'secret' 
      }),
      POSTGRES_PORT: envField.number({
        context: 'server', 
        access: 'secret' 
      }),

      // Mongo (deprecated) - server secret
      MONGODB_URI: envField.string({ 
        context: 'server', 
        access: 'secret' 
      }),

      // SMTP (all server secrets, except FROM if used client-side)
      SMTP_HOST: envField.string({ 
        context: 'server', 
        access: 'secret' 
      }),
      SMTP_PORT: envField.string({ 
        context: 'server', 
        access: 'secret' 
      }),
      SMTP_USER: envField.string({ 
        context: 'server', 
        access: 'secret' 
      }),
      SMTP_PASSWORD: envField.string({ 
        context: 'server', 
        access: 'secret' 
      }),
      SMTP_FROM: envField.string({ 
        context: 'server', 
        access: 'secret'  // Change to 'public' + context: 'client' if needed client-side
      }),

      // API Keys (server secret)
      GROK_API_KEY: envField.string({ 
        context: 'server', 
        access: 'secret' 
      }),

      // System (server secrets)
      CHROME_EXECUTABLE_PATH: envField.string({ 
        context: 'server', 
        access: 'secret' 
      }),
      CHROME_COOKIE_REDDIT: envField.string({ 
        context: 'server', 
        access: 'secret' 
      }),

      // WebAuthN (often public/client for browser use)
      WEBAUTHN_RP_ID: envField.string({ 
        context: 'client', 
        access: 'public' 
      }),
      WEBAUTHN_RP_ORIGIN: envField.string({ 
        context: 'client', 
        access: 'public' 
      }),
    },
  }
})
