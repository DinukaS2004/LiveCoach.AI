/** @type {import('tailwindcss').Config} */
module.exports = {

  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily:{
        abeezee: ["abeezee"],
        bebas: ["bebas"],
        manrope: ["manrope"]
      },

      colors: {
        // Primary brand colors
        primary: {
          dark: '#150000',
          light: '#FAFAFA',
        },

        // Accent colors
        accent: {
          yellow: '#F8FE11',
          olive: '#2F2F00',
          lime: '#C5CC40',
        },

        // Neutral/Gray scale
        neutral: {
          900: '#322D2D',
          800: '#5B5757',
          700: '#848181',
          600: '#ADABAB',
          500: '#D6D5D5',
          400: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
}