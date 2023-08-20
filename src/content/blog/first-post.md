---
title: 'Building this website'
description: 'A love story & trajedy for the ages.'
pubDate: 'Aug 19 2023'
heroImage: '/blog-placeholder-3.jpg'
---

After fidgeting around for too long trying to implement a Rust based micro-service to handle CRUD operations on the Postgres backend which would interact with my Astro based website via HTMX, I came to the conclusion that I *actually wanted* a wesbite and decided to stick with Typescript. Although, I do still dream of having that blazingly fast, scalable, micro-serviced, enterprise solution for my blog that will most likely contain less text than the number of buzz words I could boast about on Twitter. For this very reason, I am writing this post in tandum with my progress as both a journal and a readme.

First things first, I briefly checked on what Postgres solution for Typescript already existed, but then quickly realized that it was 2023 and I could probably just daisy chain random words from a dictionary appended with `.js` to just get something accomplished. This lead me to a [Prisma](https://www.prisma.io/) video from [Fireship](https://www.youtube.com/@Fireship) which had me sold in **100 seconds**, damn that guy is good. I'll leave the video below for anyone interested.

<iframe width="560" height="315" src="https://www.youtube.com/embed/rLRIB6AF2Dg" title="Prisma in 100 seconds" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

I already had a Postgres instance running on my "production" server and was quickly able to connect and `DROP tables`, finally something I'm actually good at doing! Luckily, I think only one user will be affected, and this way I was able to switch to the mich more simple & concise `prisma.schema`!

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String?
  createdAt TimeStamp @default(now())
  updatedAt TimeStamp @updatedAt
}
```

Coming from a mobile and react-native background the simple, understandable and type-safe syntac was a huge bonus for me –– reminiscent of a long forgotten love named *Parse...*