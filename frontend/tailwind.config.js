/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdfbf6',
          100: '#fbf5ea',
          200: '#f4e7cd',
          300: '#edd4a8',
          400: '#e3bc78',
          500: '#d9a351',
          600: '#cb8637',
          700: '#aa642c',
          800: '#894f29',
          900: '#6f4224',
          950: '#3f2111',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
