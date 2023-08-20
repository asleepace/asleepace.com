---
title: 'Building this website'
description: 'A love story & trajedy for the ages.'
pubDate: 'Aug 19 2023'
heroImage: '/blog-placeholder-3.jpg'
---

After fidgeting around for too long trying to implement a Rust based micro-service to handle CRUD operations on the Postgres backend which would interact with my Astro based website via HTMX, I came to the conclusion that I *actually wanted* a wesbite and decided to stick with Typescript. Although, I do still dream of having that blazingly fast, scalable, micro-serviced, enterprise solution for my blog that will most likely contain less text than the number of buzz words I could boast about on Twitter. For this very reason, I am writing this post in tandum with my progress as both a journal and a readme.

First things first, I briefly checked on what Postgres solution for Typescript already existed, but then quickly realized that it was 2023 and I could probably just daisy chain random words from a dictionary appended with `.js` to just get something accomplished. This lead me to a [Prisma](https://www.prisma.io/) video from [Fireship](https://www.youtube.com/@Fireship) which had me sold in **100 seconds**, damn that guy is good. I'll leave the video below for anyone interested.

<iframe style="aspect-ratio: 16/9; border-radius: 8px;" width="100%" height="auto" src="https://www.youtube.com/embed/rLRIB6AF2Dg" title="Prisma in 100 seconds" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

I already had a Postgres instance running on my "production" server and was quickly able to connect and `DROP tables`, finally something I'm actually good at doing! Luckily, I think only one user will be affected, and this way I was able to switch to the mich more simple & concise `prisma.schema`

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String?
  createdAt TimeStamp @default(now())
  updatedAt TimeStamp @updatedAt
}
```

Coming from an **iOS** & **react-native** background this incredibly simple, understandable and type-safe syntax was a huge bonus for me — reminiscent of a long forgotten love named *Parse...*

## User Authentication

The next things on my todo list was to prove the naysayers wrong and roll [my own crypto](https://github.com/asleepace/csa) solution for user auth ([*call me SBF*](https://en.wikipedia.org/wiki/Sam_Bankman-Fried)), but it was getting late and I wanted at least something done before I went back to playing video games. I had heard good things about **NextAuth.js** and that it worked well with **Prisma**, so I performed a quick & dirty Google search, blindly clicked the first relevent looking [link](https://dev.to/prisma/passwordless-authentication-with-next-js-prisma-and-next-auth-5g8g) and copypasta'd some random schema into my `prisma.schema` file and voila! Next I added "full-stack developer" to my LinkedIn profile and proceeded to get a 3/16 KDA in ranked Halo.

Once my disappointment from Halo surpased mine as a backend engineer, I was back and ready to `DROP *` something like never before, *since it wasn't gonna be kills tonight*.

**NextAuth.js** requires a **Simple Mail Transfer Protocol (SMTP)** implementation to verify users and I'm using an Ubuntu 20.04 box from DigitalOcean, which lead me to this [article](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-postfix-on-ubuntu-20-04) on how to set that up using [Postfix](http://www.postfix.org/). Next I needed to create a non-root user for replies and such which I aptly named `mailgod`.

### 2 Hours Later...

After running through the initialization process several times to no avail it was time for some good 'ol fashioned debugging, and by debugging I mean consuming copious amounts of *logs*, where I found by running `sudo tail -f /var/log/mail.log`

> Aug 20 06:02:21 server-droplet postfix/master[179389]: warning: /usr/lib/postfix/sbin/local: bad command startup -- throttling
>Aug 20 06:03:21 server-droplet postfix/local[179471]: fatal: configuration error: mailbox_size_limit is smaller than message_size_limit

Incredible. During the installation process **Postfix** asks the following:

> Mailbox size limit: This can be used to limit the size of messages. Setting it to 0 disables any size restriction.

For which I had put `1000000` (bytes) thinking this might mitigate would be attackers from flooding my server with garbage, and to some extent I was right it had... I guess the only thing worse than preventing myself from setting this up in the first place would be to openly blog about the implementation details online 😬

```
sudo dpkg-reconfigure postfix
```

And the problem was solved, yay email!