<div align="center">
  <img
    width="280"
    style="border-radius: 10px; border: 1px solid #ddd; padding: 5px;"
    src="https://github.com/user-attachments/assets/25c8baf2-90e6-47e2-b730-f0302232099f" />
</div>

# Asleepace.com

My personal website and digital playground, where I like to tinker with and explore different technologies!

| Service                                             | Version  | About                  |
| --------------------------------------------------- | -------- | ---------------------- |
| [ASDF](https://asdf-vm.com/guide/introduction.html) | `0.14.1` | Tool version manager.  |
| [Astro](https://astro.build/)                       | `5.1.1`  | Web framework          |
| [Bun](https://bun.sh/)                              | `1.1.42` | JavaScript runtime     |
| [PM2](https://pm2.keymetrics.io/)                   | `5.3.0`  | Daemon process manager |
| [React](https://react.dev/)                         | `19.0.0` | Frontend library       |

## Table of Contents

You can find more detailed documentation in the [services](services) directory.

1. [Nginx documentation & configuration](/services/nginx/)
2. [Postfix documentation & configuration](/services/smtp/)
3. [ZSH documentation & configuration](/services/zsh/)
4. [Misc documentation & configuration](/services/misc/)

## Quick Start

The following is mainly just a reference for myself, but feel free to use it if you find it helpful!

```bash
# use one of these to login to the remote server
ssh root@asleepace.com
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

# Memory usage
ps aux --sort=-%mem | head -n 10

# Debug logs
pm2 logs
pm2 logs --last 200
pm2 logs asleepace.com
pm2 logs stockindx.com
sudo tail -f /var/log/syslog
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/mail.log
sudo journalctl -u errors
sudo journalctl -u ufw
```

# Installation

If you are interested in running this project locally, you can follow the steps below to get started. **NOTE**: You can skip installing ASDF and PM2 as they are mainly used for managing several tool versions in a server environment.

```bash
# install Bun (JavaScript runtime)
curl -fsSL https://bun.sh/install | bash # for macOS, Linux, and WSL

# install ASDF (tool version manager)
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.15.0

# add the following to your shell profile (bash or zsh)
echo '. "$HOME/.asdf/asdf.sh"' >> ~/.bashrc
echo '. "$HOME/.asdf/asdf.sh"' >> ~/.zshrc

# source your shell profile (bash or zsh)
source ~/.bashrc
source ~/.zshrc

# add ASDF plugins (from .tool-versions)
cut -d' ' -f1 .tool-versions | xargs -I {} asdf plugin add {}

# install ASDF plugins
asdf install

# download the project
git clone git@github.com:asleepace/asleepace.com.git
cd asleepace.com

# install, check, and run the project
bun i
bun run check
bun run build:tailwind
bun run dev

# build project for production
bun run build:tailwind
bun run build
bun run preview
```

# Troubleshooting

Make sure your sever has a swap file, this is a requirement for the build process to work.

```bash
# Remove old swapfile
sudo swapoff /swapfile
sudo rm /swapfile

# Create new one with proper permissions
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Verify it's working
free -h
```

If you run into any issues during the build process, usually it is because of an OOM issue, you can try running the following command to free up some memory:

```bash
# Check current swap
free -h

# Add more swap if needed (as root)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Check disk space usage
df -h

# Check largest directories/files
du -hs /* | sort -rh | head -n 10

# Find large files
find / -type f -size +100M -exec ls -lh {} \;

# Check largest directories in root
du -h --max-depth=1 / | sort -rh | head -n 10

# Check Docker if you're using it
docker system df

# Look for large log files
find /var/log -type f -size +100M

# Clean package manager cache
apt-get clean
apt-get autoremove

# NOTE: installed ncdu to check disk space usage
sudo apt-get install ncdu
sudo ncdu /

# NOTE: this was taking up a lot of space
sudo rm -rf /usr/local/share/.cache

# NOTE: the journalctl was taking up a lot of space
journalctl --vacuum-time=3d
```

After changing the swap file, cleaning up the system cache, removing large log, etc. I was able to finally get it to build again. During the build process I was able to get the following error:

```bash
09:58:49 [WARN] [vite]
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
```

# Getting Started

This website is deployed on a linux machine which contains several other projects which also use Bun. I recommend using ASDF to handle managing pacakge versions, here is the current config returned by running `asdf info`.

```
OS:
Linux asleepace-droplet 6.5.0-44-generic #44-Ubuntu SMP PREEMPT_DYNAMIC Fri Jun  7 15:10:09 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux

SHELL:
GNU bash, version 5.2.15(1)-release (x86_64-pc-linux-gnu)
Copyright (C) 2022 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>

This is free software; you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

BASH VERSION:
5.2.15(1)-release

ASDF VERSION:
v0.14.1-f00f759

ASDF INTERNAL VARIABLES:
ASDF_DEFAULT_TOOL_VERSIONS_FILENAME=.tool-versions
ASDF_DATA_DIR=/root/.asdf
ASDF_DIR=/root/.asdf
ASDF_CONFIG_FILE=/root/.asdfrc

ASDF INSTALLED PLUGINS:
bun                          https://github.com/cometkim/asdf-bun.git main 019058c
nodejs                       https://github.com/asdf-vm/asdf-nodejs.git master 93bd217
yarn                         https://github.com/twuni/asdf-yarn.git main 376c540
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

# SMTP / Email

This server also contains an SMTP server which can be used to send emails and process incoming emails.

```bash
# check Postfix status
sudo systemctl status postfix

# connect to the Postfix SMTP server
telnet localhost 25

# enter the following send an email
HELO localhost
MAIL FROM: test@example.com
RCPT TO: your@email.com
DATA
Subject: Test Email
This is a test.
.
QUIT # to exit

# send an email
echo "Subject: Test" | sendmail -v user@example.com
```

# SMTP Local

Postfix is also available on Unix and comes pre-installed on MacOS, add the following to your `/etc/postfix/main.cf` file to relay to the remote server.

```bash
# edit the main.cf file (nano gang)
sudo nano /etc/postfix/main.cf
```

Then add the following to the bottom of the file

```conf
# replace 2525 with your custom port with your actual domain
relayhost = [localhost]:2525
smtp_sasl_auth_enable = yes
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_sasl_security_options = noanonymous
smtp_tls_security_level = encrypt
```

**IMPORTANT**: Instead of relaying with ports we are going to use SSH from our local machine to send emails.

```bash
# SSH Tunnel (local)
#
# run this command on your local machine, note that the port 2525 is the port we are forwarding from (MacOS)
# and the port 25 is the port we are forwarding to (remote).
#
# options:
#   -f: run in the background
#   -N: do not execute a remote command
#   -L: forward local port 2525 to localhost:25
#
ssh -f -N -L 2525:localhost:25 root@asleepace.com

# Troubleshooting
#
# if you need to find this connection, run the following command:
ps aux | grep "ssh -f -N"

# Kill the connection
#
# replace <process_id> with the actual process id from the previous command
#
kill <process_id>
```

The square brackets tell Postfix to treat asleepace.com as a hostname rather than potentially misinterpreting it as an MX record lookup. This is especially important when specifying a port number.

```bash
# edit the sasl_passwd file
sudo nano /etc/postfix/sasl_passwd
```

add the following

```conf
[asleepace.com]:25    username:password
```

Make sure to replace `username` and `password` with your actual credentials.

Next run the following command to create the hash for the `sasl_passwd` file

```bash
# create the password hash
sudo postmap /etc/postfix/sasl_passwd
sudo chmod 600 /etc/postfix/sasl_passwd*

# Postfix commands (macOS)
sudo postfix reload
sudo postfix start
sudo postfix stop
sudo postfix status
sudo killall postfix

# Postfix commands (linux)
sudo systemctl restart postfix
sudo systemctl start postfix
sudo systemctl stop postfix
sudo systemctl status postfix


# run the following to test the connection
sudo postfix stop
sudo postfix start
sudo postfix reload

# send an email (might be slightly different on odler versions)
echo "Test mail" | mail -s "Test" your@email.com

# check the mail queue
mailq

# check the logs
sudo tail -f /var/log/mail.log
```

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
