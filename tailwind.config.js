/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#faf3e6',
          100: '#f4e7cd',
          200: '#e9d3a5',
          300: '#dcbb77',
          400: '#cfa052',
          500: '#c28e3f',
          600: '#a97431',
          700: '#8a5d2a',
          800: '#714c27',
          900: '#5d3f22',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(16 24 40 / 0.06), 0 1px 3px 0 rgb(16 24 40 / 0.1)',
        'card-lg': '0 4px 6px -2px rgb(16 24 40 / 0.05), 0 12px 16px -4px rgb(16 24 40 / 0.1)',
      },
    },
  },
  plugins: [],
}
