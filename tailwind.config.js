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
          50: '#f2f1ff',
          100: '#e9e6ff',
          200: '#d6d0ff',
          300: '#b7acff',
          400: '#927bff',
          500: '#6f46ff',
          600: '#5b21f4',
          700: '#4c16d0',
          800: '#3f13a6',
          900: '#351484',
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
