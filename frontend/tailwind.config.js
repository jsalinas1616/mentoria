/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6B8E23',
          light: '#7A9B3C',
          dark: '#5A7A1F',
        },
        accent: {
          DEFAULT: '#8FB339',
          hover: '#7A9B2F',
        },
        dark: {
          card: '#2C2C2C',
          input: '#3A3A3A',
          bg: '#1E1E1E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


