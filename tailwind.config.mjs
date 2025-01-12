/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    screens: {
      xs: '400px',
      '2md': '800px',
      '3md': '960px',
      // Keep default breakpoints
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      scale: {},
      animation: {},
      keyframes: {},
    },
    colors: {
      editor: {
        100: '#292d3e',
        200: '#212432',
      },
    },
  },
  plugins: [],
}
