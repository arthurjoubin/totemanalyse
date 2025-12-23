/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'totem-green': '#006B4F',
        'totem-light': '#00A67B'
      }
    }
  },
  plugins: [],
}
