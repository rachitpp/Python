/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Use built-in colors from Tailwind CSS
        gray: colors.gray,
        neutral: colors.neutral,
        slate: colors.slate,
        zinc: colors.zinc,
      },
    },
  },
  plugins: [],
}
