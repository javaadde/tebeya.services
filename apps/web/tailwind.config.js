/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#fdf6f2',
          100: '#faeae3',
          200: '#f5d5c7',
          300: '#edb49f',
          400: '#e66434',
          500: '#e66434', // User requested #e66434
          600: '#cf5224',
          700: '#ad4019',
          800: '#8c3417',
          900: '#732c16',
        },
        sand: {
          50: '#fcfbf9',
          100: '#f7f4ef',
          200: '#dad0c3', // User requested #dad0c3
          300: '#c7baa8',
          400: '#ab9b84',
          500: '#8f7d67',
          600: '#736350',
          700: '#5c4e3f',
          800: '#473d32',
          900: '#383028',
        },
        brand: {
          DEFAULT: '#e66434',
          primary: '#e66434',
          secondary: '#dad0c3',
          dark: '#1c1917',
          50: '#fdf6f2',
          100: '#faeae3',
          500: '#e66434',
          600: '#cf5224',
          700: '#ad4019',
        },
      },
    },
  },
  plugins: [],
};
