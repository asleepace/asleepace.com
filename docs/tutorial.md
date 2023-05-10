---
title: Custom Server
slug: /server
---

## Connect

SSH into the remote server with the following command:

```
ssh root@192.241.216.26
```

## Configure GitHub

- [GitHub Documentation](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)

1. Generate new key-pair on server

```
ssh-keygen -t ed25519 -C "colin_teahan@yahoo.com"
```

- enter a password for more security
- leave blank to skip (most used)
- save to `~/.ssh/id_ed25519.pub`

2. Copy public key to clipboard

```
pbcopy < ~/.ssh/id_ed25519.pub
```

or print out and copy manualy

```
cat < ~/.ssh/id_ed25519.pub
```

3. Add the `ssh-key` to GitHub

https://github.com/settings/keys

4. Download project via SSH

Back in the SSH terminal session download the project:

```
git@github.com:asleepace/asleepace.com.git
```

## Configure NGINX

- [Nginx Documentaion](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04)

Back in the SSH terminal run

```
sudo apt update
sudo apt install nginx
```

Press `accept` and `enter` and now it's time to configure the firewall

```
sudo ufw enable
sudo ufw app list
sudo ufw allow 'Nginx HTTP'
sudo ufw status
```

now we can check if our server is receiving requests, in the browser

[https://192.241.216.26](https://192.241.216.26)

and you should see your site!

## Configure Nginx & Next

```
sudo nano /etc/nginx/sites-available/asleepace.com
```

then paste the following

```
server {
        client_max_body_size 64M;
        listen 80;
        server_name slingacademy.com www.slingacademyc.om;

        location / {
                proxy_pass             http://127.0.0.1:3000;
                proxy_read_timeout     60;
                proxy_connect_timeout  60;
                proxy_redirect         off;

                # Allow the use of websockets
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }

}
```

then create a symlink, check the syntax & restart

```
sudo ln -s /etc/nginx/sites-available/asleepace.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Configure Node

- [DigitalOcean Documentation](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)

Back in the SSH session we are now going to install `node` and `npm`

```
sudo apt update
sudo apt install nodejs
sudo apt install npm
```

now time to install `pm2`

```
npm install -g pm2
```

and then let's build the application!

```
cd ~/asleepace.com
npm install
npm run build
pm2 start npm --name "asleepace-web-app" -- start
pm2 status
```

## Configure SSL Certificate

- [DigitalOcean Nginx, UFW & Certbot Documentation](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04)

```
sudo systemctl start nginx
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d asleepace.com -d www.asleepace.com
sudo systemctl restart nginx
sudo systemctl status certbot.timer
```
