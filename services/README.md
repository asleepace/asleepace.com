# Services

This directory contains copies of system configuration files for various Linux / Unix systems which are used in this project such as Nginx, Postfix, etc. to help track changes and updates.

- [Nginx](./nginx/) - web server and reverse proxy
- [Postfix](./smtp/) - SMTP (mail server)
- [Zsh](./zsh/) - zsh & bash shell
- [Misc](./misc/) - misc. items

## Quick Start

```bash
# connect to the server
ssh root@asleepace.com

# firewall
sudo ufw status
sudo ufw allow 22/tcp
sudo ufw allow 2525/tcp
sudo ufw delete 4000

# common system commands
sudo systemctl reload nginx
sudo systemctl status nginx
sudo systemctl start postfix
sudo systemctl stop postfix
sudo systemctl restart nginx
sudo systemctl enable postfix
sudo systemctl disable postfix

# common pm2 commands
pm2 start $service_name
pm2 stop $service_name
pm2 restart $service_name
pm2 status $service_name
pm2 logs $service_name

# common memory commands
free -h
df -h
ncdu /
ps aux
```

## [Nginx](./nginx/ABOUT.md)

Common commands for Nginx:

```bash
# common system commands
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl status nginx
sudo systemctl enable nginx
sudo systemctl disable nginx
sudo systemctl reload nginx

# nginx configuration locations
sudo nano /etc/nginx/nginx.conf
sudo nano /etc/nginx/sites-available/asleepace.com
sudo nano /etc/nginx/sites-enabled/asleepace.com

# validate nginx configuration
sudo nginx -t

# refresh after making changes to conf files
sudo systemctl reload nginx
sudo systemctl restart nginx

# view nginx logs
sudo journalctl -u nginx


# Copy to clipboard
echo "text" | xclip -selection clipboard

# Copy file content
cat file.txt | xclip -selection clipboard
```

## [Postfix](./smtp/ABOUT.md)

```bash
# start Postfix
sudo systemctl start postfix

# stop Postfix
sudo systemctl stop postfix
```

## [ZSH](./zsh/ABOUT.md)

Common commands for ZSH:

```bash
# edit ZSH configurations
sudo nano ~/.zshrc
sudo nano ~/.zprofile
sudo nano ~/.zsh_aliases

# reload ZSH after making changes
source ~/.zshrc
```

## [PM2](./pm2/ABOUT.md)

Common commands for PM2:

```bash
# list all PM2 services
pm2 list

# restart a PM2 service
pm2 restart asleepace.com

# stop a PM2 service
pm2 stop asleepace.com

# delete a PM2 service
pm2 delete stockindx.com

# show PM2 logs
pm2 logs asleepace.com
```

## [Misc](./misc/ABOUT.md)

Common commands for Misc:

```bash
# show all running services
ps aux | grep -E 'nginx|postfix|zsh|node|bun|pm2'

# copy files from one machine to another
scp $from_machine:$path $to_machine:$path

# copy files from server to local
scp root@asleepace.com:/path/to/file.txt .

# copy files from local to server
scp file.txt root@asleepace.com:/path/to/file.txt
```

## Package Scripts

You can find common scripts for managing memory, disk, logs, etc. in our `package.json` file or in the [Misc](./misc/ABOUT.md) directory.

```json
"scripts": {
  "check": "bun --bun astro check",
  "dev": "bunx --bun astro dev",
  "start": "bunx --bun astro build --port 4321 && bunx --bun astro preview --port 4321",
  "build": "bunx --bun astro build",
  "build:debug": "DEBUG=astro:*,vite:* bunx --bun astro build --verbose",
  "preview": "bunx --bun astro preview",
  "build:tailwind": "npx tailwindcss -i ./src/styles/global.css -o ./src/styles/output.css",
  "watch:tailwind": "npx tailwindcss -i ./src/styles/global.css -o ./src/styles/output.css --watch",
  "deploy": "./scripts/deploy.sh",
  "astro": "bunx --bun astro",
  "util:upgrade": "bun upgrade",
  "util:check": "bunx --bun astro check",
  "run:server": "bun ./dist/server/entry.mjs",
  "logs": "pm2 logs",
  "logs:recent": "pm2 logs --last 200",
  "logs:system": "sudo tail -f /var/log/syslog",
  "logs:asleepace": "pm2 logs asleepace.com",
  "logs:stockindx": "pm2 logs stockindx.com",
  "logs:nginx": "sudo tail -f /var/log/nginx/error.log",
  "logs:nginx:access": "sudo tail -f /var/log/nginx/access.log",
  "logs:ufw": "sudo journalctl -u ufw",
  "logs:postfix": "sudo tail -f /var/log/mail.log",
  "logs:errors": "sudo journalctl -u errors",
  "memory": "df -h",
  "storage": "df -h",
  "disk": "ncdu /",
  "free": "free -h"
}
```

## Resources

- [Installation](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04)
- [Ubuntu 20.0.4](https://releases.ubuntu.com/20.04/)
- [UFW Firewall](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu-18-04)
- [NGINX](https://www.nginx.com/resources/wiki/?_bt=541137080527&_bk=&_bm=b&_bn=g&_bg=125748574545&gclid=CjwKCAjw4KyJBhAbEiwAaAQbE6ZBE80EtqlFLNQ4UHlTNbyCw0tTxKhCbFsAVgTbiHZWxbExVTAasRoCoJIQAvD_BwE)
- [IPV4 Adress](198.199.98.58)
- [SSH Keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh)
- [UFW Firewall](https://github.com/soladex/web/blob/main/docs/ufw.md)
- [OpenSSL](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04)
- [Parse](https://www.digitalocean.com/community/tutorials/how-to-run-parse-server-on-ubuntu-14-04)
