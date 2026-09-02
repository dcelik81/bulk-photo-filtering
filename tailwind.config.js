/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#18181b', // zinc-900
        surface: '#27272a', // zinc-800
        border: '#3f3f46', // zinc-700
      }
    },
  },
  plugins: [],
}
