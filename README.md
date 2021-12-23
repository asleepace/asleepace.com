# General Overview

- [Installation](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04)
- [Ubuntu 20.0.4](https://releases.ubuntu.com/20.04/)
- [UFW Firewall](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu-18-04)
- [NGINX](https://www.nginx.com/resources/wiki/?_bt=541137080527&_bk=&_bm=b&_bn=g&_bg=125748574545&gclid=CjwKCAjw4KyJBhAbEiwAaAQbE6ZBE80EtqlFLNQ4UHlTNbyCw0tTxKhCbFsAVgTbiHZWxbExVTAasRoCoJIQAvD_BwE)
- [IPV4 Adress](198.199.98.58)
- [SSH Keys](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh)
- [UFW Firewall](https://github.com/soladex/web/blob/main/docs/ufw.md)
- [OpenSSL](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04)
- [Parse](https://www.digitalocean.com/community/tutorials/how-to-run-parse-server-on-ubuntu-14-04)

# Getting Started

- Conecting to server
```
ssh root@143.110.153.76
```
        
- Starting NGINX
```
systemctl status nginx
```

- Project Location
```
cd /var/www/asleepace.com
```

# NGINX

Managing the Nginx Process and basic management commands [source](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04)

- ### NGINX Configuration

      sudo nano /etc/nginx/nginx.conf

- ### Soldaex Configuration

      sudo nano /etc/nginx/sites-available/soladex

- ### Configration File
      
      server {
        listen 80;
        listen [::]:80;

        root /var/www/soladex/html;
        index index.html index.htm index.nginx-debian.html;

        server_name soladex.co www.soladex.co;

        location / {
                try_files $uri $uri/ =404;
        }
      }


- ### Stop Server

      sudo systemctl stop nginx
 
- ### Start Server

      sudo systemctl start nginx

- ### Restart Server

      sudo systemctl restart nginx
 
- ### Reload Config

      sudo systemctl reload nginx
 
- ### Disable Autoboot

      sudo systemctl disable nginx
 
- ### Enable Autoboot (default)

      sudo systemctl enable nginx


## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
