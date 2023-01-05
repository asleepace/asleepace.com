# General Overview

This guide outlines the process for setting up a new website with [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/) and [Tailwind](https://tailwindcss.com/docs/guides/nextjs).

## Installation

Create a new [next.js](https://nextjs.org/) project with typescript:

```bash
npx create-next-app@latest my-project --typescript --eslint
cd my-project
```

Instsall Tailwind:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure template paths in `tailwind.config.js`:

```Javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
