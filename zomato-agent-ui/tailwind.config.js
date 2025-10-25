/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zomato: {
          primary: '#E23744',
          secondary: '#FF6B6B',
          accent: '#FFD93D',
          dark: '#2C3E50',
          light: '#F8F9FA'
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
