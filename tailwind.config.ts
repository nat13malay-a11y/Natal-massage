import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nude: {
          50:  '#FAF7F4',
          100: '#F5EDE4',
          200: '#EED9C8',
          300: '#E3C4AA',
          400: '#D4A882',
          500: '#C48B62',
          600: '#B07050',
        },
        sage: {
          50:  '#F4F8F4',
          100: '#E4EFE4',
          200: '#C8DFC8',
          300: '#A8C8A8',
          400: '#85AE85',
          500: '#639463',
        },
        sky: {
          50:  '#F0F8FF',
          100: '#E1F0FA',
          200: '#C3E1F5',
          300: '#96CAE8',
          400: '#63B0D8',
          500: '#3D94C0',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float':    'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
