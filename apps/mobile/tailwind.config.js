/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          coral: '#df3b20',
          dark: '#c73017',
          light: '#fdece8',
        },
        primary: {
          50: '#fdece8',
          100: '#fad4cc',
          200: '#f6ad9d',
          300: '#f07f68',
          400: '#e85638',
          500: '#df3b20', // Main terracotta/orange-red brand color from designs
          600: '#c92f16',
          700: '#a72310',
          800: '#8a1f11',
          900: '#731e13',
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
