---
title: 'SSR with Bun, Elysia & React'
description: 'How to build a simple website using React, Bun and Elysia with server-side rendering in 2023.'
author: 'Colin Teahan'
pubDate: 'Sep 13 2023'
heroImage: '/bun-elysia-react-banner.png'
---


This article will show you how to create a simple website using [Bun](https://bun.sh/docs/installation), [Elysia](https://elysiajs.com/) and [React](https://react.dev/) with support for server-side rendering.

- **Bun** the JS/TS bundler, runtime & package manager
- **Elysia** a framework for building performant web applications
- **React** a JavaScript library for building user interfaces

Original source code here on [GitHub](https://github.com/asleepace/bun-elysia-react-srr-example).

### Pre-requisites

Before we begin make sure you have **Bun** installed on your machine

```bash
curl -fsSL https://bun.sh/install | bash # for macOS, Linux, and WSL
```

[Bun installation documentation](https://bun.sh/docs/installation)

Next let's initialize a new project with **Elysia** by running the following command in your terminal

```bash
bun create elysia your-project-name # edit this
cd your-project-name
bun run dev
```

[Elysia installation documentation](https://elysiajs.com/quick-start.html) 

You should see the following in your terminal

> 🦊 Elysia is running at localhost:3000

And the following when you visit [http://localhost:3000](http://localhost:3000)

> Hello, Elysia!

### Project Structure

Next lets go ahead and define two more folders in our project which will hold our static files and react code.

```bash
mdkir public
mkdir src/react
```

You project structure should now look like this

```bash
├── ./your-project-name
│   ├── node_modules
│   ├── public            # client-side static files
│   ├── src 
│   │   ├── react         # react code
│   │   └── index.ts      # server-side entry point
│   ├── .gitignore
│   ├── bun.lock.b
|   ├── package.json
│   ├── README.md
│   ├── tsconfig.json
│   └── yarn.lock
```

We want to be able to return static files from our server, so lets go ahead and add the following **Elysia** static plugin.

```bash
bun add @elysiajs/static
```

This will allow the client to request static files from our server such as images, css, js, etc. Now replace the contents of your `src/index.ts` file with

```ts
// src/index.ts
import { Elysia } from "elysia";
import { staticPlugin } from '@elysiajs/static'

const app = new Elysia()
  .use(staticPlugin())
  .get('/', () => {
    return 'Our first route'
  })
  .listen(3000)
```
The static plugin default folder is public, and registered with `/public` prefix. [Click here to learn more](https://elysiajs.com/plugins/static.html)

## React Setup

The next thing we want to do is be able to render our React code on the server, so let's go ahead and add the following dependencies

```bash
bun add react react-dom  # article is using 18.2.0
```

Next let's create our React application by adding a file called `App.tsx` in our `./src/react/` folder with the following code

```tsx
// src/react/App.tsx
import React, { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Bun, Elysia & React</title>
        <meta name="description" content="Bun, Elysia & React" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <h1>Counter {count}</h1>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </body>
    </html>
  );
}
```

[React server-side rendering documentation](https://react.dev/reference/react-dom/server/renderToReadableStream)

Now back in our `./src/index.ts` let's import this component by adding the following line

```ts
// src/index.ts
import App from './react/App'
```

Don't worry if you see a type error, we will fix in the next section.


## Fixing Type Errors

At this point you should see a couple type errors since we haven't specified how our project should handle JSX and React types. To fix this add the following dev dependencies

```bash
bun add -d @types/react @types/react-dom
```

Next let's specify how the project should handle **JSX** by opening our `./tsconfig.json` and setting the following options

```json
{
  "jsx": "react",
  "jsxFactory": "React.createElement",
  "jsxFragmentFactory": "React.Fragment",
}
```

For more information refer to the [Bun JSX documentation](https://bun.sh/docs/runtime/jsx). The type errors should now be gone, but sometimes you need to restart your IDE for the changes to take effect; *looking at you VSCode*...

## React SSR

Now back in our `./src/index.ts` let's go ahead and render our React component by adding the following

```ts
// src/index.ts
import { Elysia } from "elysia";
import { staticPlugin } from '@elysiajs/static'
import { renderToReadableStream } from 'react-dom/server'
import { createElement } from "react";
import App from './react/App'

const app = new Elysia()
  .use(staticPlugin())
  .get('/', async () => {

    // create our react App component
    const app = createElement(App)

    // render the app component to a readable stream
    const stream = await renderToReadableStream(app, {
      bootstrapScripts: ['/public/index.js']
    })

    // output the stream as the response
    return new Response(stream, {
      headers: { 'Content-Type': 'text/html' }
    })
  })
  .listen(3000)
```

Make sure your local dev server is still running if you closed your IDE earlier by running the following from the project root

```bash
bun run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser and you should see the following

<img src="/ssr-exmaple.png" style="box-shadow: 0px 1px 5px rgba(0,0,0,0.1);" alt="React SSR" width="100%" />

However, you may notice that pressing the button doesn't increment the counter. This is because we haven't added any client-side code yet. Let's go ahead and do that now. Create a new file called `index.tsx` in your `./react/` folder with the following code

```tsx
// src/react/index.tsx
// Make sure to include the following two lines:
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import App from './App.js'

hydrateRoot(document, <App />)
```
Normally this is where we would call `createRoot`, but since the root will be created on the server, all we need to do is hydrate the client after the initial load. This will attach event listeners to the server-generated HTML and make it interactive.

[How to add DOM types in Bun](https://bun.sh/docs/runtime/typescript#add-dom-types)

## Bundle Client JS

We are almost there! The last step is to bundle our `react` code which will be loaded by the client. Luckily **Bun** has a built-in bundler which we can use to bundle our client-side code. We could do this via the command line or as a script in our `package.json`, but for this example we will do it programmatically in our `./src/index.ts` file, just add the following at the top of the file

```ts
// src/index.ts
await Bun.build({
  entrypoints: ['./src/react/index.tsx'],
  outdir: './public',
});
```

Now our **React** code will be automatically bundled each time we start our server! You can verify this by checking if the `./public/index.js` file exists. Make sure that this file patch matches the `bootstrapScripts` option in our `./src/index.ts` file.

```ts
// Make sure the bootstrapScripts matches the output
// file path in your ./public folder
const stream = await renderToReadableStream(app, {
  bootstrapScripts: ['/public/index.js']  
})
```

Now open [http://localhost:3000](http://localhost:3000) in your browser, the counter should now be working!

## Conclusion

Congratulations you have just created a simple website using Bun, Elysia and React with support for server-side rendering!

If you have any additional questions feel free to reach out to me on [Twitter](https://twitter.com/asleepace) or dropping me an email at colin@asleepace.com :)

**Recommended Reading**

- [React Readable Streams](https://react.dev/reference/react/Suspense)
- [React Suspense](https://react.dev/reference/react/Suspense)


## Helpful Resources

The following links are helpful resources for learning more about the technologies used in this project:

- [How to server static files with Elysia](https://elysiajs.com/plugins/static.html)
- [How to create a simple website with Elysia](https://elysiajs.com/quick-start.html)
- [How to configure Bun with DOM types](https://stackoverflow.com/a/75726039/4326715)
- [How to configure Bun with JSX documentation](https://bun.sh/docs/runtime/jsx)
- [How to bundle assets with Bun documentation](https://bun.sh/docs/bundler)
- [How to render react on the server](https://react.dev/reference/react-dom/server/renderToReadableStream)

If you have any additional questions feel free to reach out to me on [Twitter](https://twitter.com/asleepace) or dropping me an [email](mailto:colin@asleepace.com).

## TL;DR

Here is the final code from the article, you can also view this project on [GitHub](https://github.com/asleepace/bun-elysia-react-srr-example).

#### Project Structure

```bash
├── ./your-project-name
│   ├── node_modules
│   ├── public              # client-side static files
│   │   └── index.js        # generated client bundle
│   ├── src 
│   │   ├── react
│   │   │   ├── App.tsx     # react application
│   │   │   └── index.tsx   # client-side entry point
│   │   └── index.ts        # server-side entry point
│   ├── bun.lock.b
│   ├── package.json
│   ├── tsconfig.json
│   └── yarn.lock
```

#### **src/index.ts**

```ts
// src/index.ts
import { Elysia } from "elysia";
import { staticPlugin } from '@elysiajs/static'
import { renderToReadableStream } from 'react-dom/server'
import { createElement } from "react";
import App from './react/App'

// bundle client side react-code
await Bun.build({
  entrypoints: ['./src/react/index.tsx'],
  outdir: './public',
});

// start a new Elysia server on port 3000
const app = new Elysia()
  .use(staticPlugin())
  .get('/', async () => {

    // create our react App component
    const app = createElement(App)

    // render the app component to a readable stream
    const stream = await renderToReadableStream(app, {
      bootstrapScripts: ['/public/index.js']
    })

    // output the stream as the response
    return new Response(stream, {
      headers: { 'Content-Type': 'text/html' }
    })
  })
  .listen(3000)
```

#### src/react/App.tsx

```tsx
// src/react/App.tsx
import React, { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Bun, Elysia & React</title>
        <meta name="description" content="Bun, Elysia & React" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <h1>Counter {count}</h1>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </body>
    </html>
  );
}
```

#### src/react/index.tsx

```tsx
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import App from './App.js'

hydrateRoot(document, <App />)
```

#### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "jsx": "react",
    "jsxFactory": "React.createElement",
    "jsxFragmentFactory": "React.Fragment",
    "module": "ES2022",
    "moduleResolution": "node",
    "types": ["bun-types"],
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

### package.json

```json
{
  "name": "bun-elysia-react-ssr",
  "version": "1.0.0",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "bun run --watch src/index.ts"
  },
  "dependencies": {
    "@elysiajs/static": "^0.6.0",
    "elysia": "latest",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.21",
    "@types/react-dom": "^18.2.7",
    "bun-types": "latest"
  },
  "module": "src/index.js"
}
```

Article and [source code](https://github.com/asleepace/bun-elysia-react-srr-example) by [Colin Teahan](https://www.linkedin.com/in/colin-teahan/?lipi=urn%3Ali%3Apage%3Ad_flagship3_feed%3BeM7QoEWiSIOwjiKXlYu0VA%3D%3D)

<h1>🥳</h1>