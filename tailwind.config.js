/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        scaleIn: {
          '0%':   { transform: 'scale(0)',    opacity: '0' },
          '70%':  { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        fadeUp: {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },
      animation: {
        'scale-in': 'scaleIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'fade-up':  'fadeUp 0.35s ease-out 0.2s both',
      },
    },
  },
  plugins: [],
}
