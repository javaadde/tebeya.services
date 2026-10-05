/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['BricolageGrotesque_400Regular', 'sans-serif'],
      },
      colors: {
        brand: {
          coral: '#598A31',
          primary: '#598A31',
          dark: '#487226',
          light: '#f4f8ef',
        },
        primary: {
          50: '#f4f8ef',
          100: '#e6f0dc',
          200: '#cee2be',
          300: '#b0d199',
          400: '#82b55b',
          500: '#598A31', // Main brand color from designs
          600: '#487226',
          700: '#38591e',
          800: '#2c4419',
          900: '#213514',
        },
        appBg: '#d4d5d6', // Exact warm light-gray background from designs
        navDark: '#201d1e', // Exact dark charcoal floating bottom bar
        surface: {
          light: '#d4d5d6',
          card: '#ffffff',
          dark: '#201d1e',
        },
      },
      borderRadius: {
        '3xl': '28px',
        '4xl': '36px',
      },
    },
  },
  plugins: [],
};
