/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FBF9F4',
          100: '#F4F0E8',
          200: '#ECE6D9',
          300: '#DED6C4',
          400: '#C9BEA8',
        },
        ink: {
          900: '#100F0C',
          800: '#1B1A16',
          700: '#2A2823',
          500: '#5C5850',
          400: '#8A8579',
        },
        clay: {
          400: '#D2693E',
          500: '#B5471F',
          600: '#963617',
        },
        moss: {
          500: '#5B6147',
          600: '#474C36',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
      },
      letterSpacing: {
        ultra: '0.35em',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
