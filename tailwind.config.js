/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C19A6B', // warm wheat
        secondary: '#F5F5DC', // cream/off-white
        accent: '#4CAF50', // green for success
        error: '#F44336'
      }
    },
  },
  plugins: [],
}
