/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Bricolage Grotesque Variable"', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f4f8ef',
          100: '#e6f0dc',
          200: '#cee2be',
          300: '#b0d199',
          400: '#82b55b',
          500: '#598A31', // Primary brand color
          600: '#487226',
          700: '#38591e',
          800: '#2c4419',
          900: '#213514',
        },
        terracotta: {
          50: '#f4f8ef',
          100: '#e6f0dc',
          200: '#cee2be',
          300: '#b0d199',
          400: '#82b55b',
          500: '#598A31',
          600: '#487226',
          700: '#38591e',
          800: '#2c4419',
          900: '#213514',
        },
        sand: {
          50: '#fcfbf9',
          100: '#f7f4ef',
          200: '#dad0c3',
          300: '#c7baa8',
          400: '#ab9b84',
          500: '#8f7d67',
          600: '#736350',
          700: '#5c4e3f',
          800: '#473d32',
          900: '#383028',
        },
        brand: {
          DEFAULT: '#598A31',
          primary: '#598A31',
          secondary: '#dad0c3',
          dark: '#1c1917',
          50: '#f4f8ef',
          100: '#e6f0dc',
          500: '#598A31',
          600: '#487226',
          700: '#38591e',
        },
      },
    },
  },
  plugins: [],
};
