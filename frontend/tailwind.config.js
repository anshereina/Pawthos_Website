/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // This line is absolutely CRUCIAL. It tells Tailwind to scan all your React files.
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Ensure 'Inter' font is defined if you use it
      },
    },
  },
  plugins: [],
}
