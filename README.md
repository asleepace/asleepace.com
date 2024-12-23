# Asleepace.com

My person website & playground.

```bash
# use this to login to the remote server
ssh root@192.241.216.26

# flow for updating on the site
bun i
bun run check
bun run build:tailwind
bun run build
bun run preview

# save the process with pm2
pm2 start --name "asleepace.com" --watch --interpreter $(which bun) dist/server/entry.mjs

# NGINX Configuration
sudo nano /etc/nginx/sites-available/asleepace.com
sudo ln -s /etc/nginx/sites-available/asleepace.com /etc/nginx/sites-enabled/asleepace.com

# Test the NGINX configuration
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl reload nginx
```

# Server Commands

Connect to the server via SSH

```bash
ssh root@192.241.216.26
```

Build the website from scratch

```bash
bun i
bun run build:tailwind
bun run build
```

Start the process with **pm2** run the following commands, since the application now uses ASDF we need to specify the path to the bun executable.

```bash
pm2 stop asleepace.com
pm2 start --name "asleepace.com" --watch --interpreter $(which bun) dist/server/entry.mjs
```

Use the following command to restart the postgres server

```bash
sudo systemctl restart postgresql
```

Renew SSL certificates

```bash
# View existing certificates
sudo certbot certificates

# Renew all certificates
sudo certbot renew

# Renew specific certificate
sudo certbot renew --cert-name example.com

# Request a new certificate
sudo certbot --nginx -d example.com -d www.example.com

# Delete a certificate
sudo certbot delete --cert-name example.com

# Test automatic renewal
sudo certbot renew --dry-run
```

- [Expose postgres server to external host](https://www.bigbinary.com/blog/configure-postgresql-to-allow-remote-connection)

# API Documentation

All the API endpoints can be found in the `src/api` directory, and each should include a `HEAD` method which will return the schema of the endpoint.

- `api/proxy` - fetches content from external sources and returns it to the client
- `api/exec` - fetches & executes content from external sources and returns it to the client

# Astro Starter Kit: Blog

```
npm create astro@latest -- --template blog
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/blog)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/blog/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![blog](https://github.com/withastro/astro/assets/2244813/ff10799f-a816-4703-b967-c78997e8323d)

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and OpenGraph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:3000`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
