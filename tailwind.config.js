/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        sage: '#9DACAF',
        clay: '#C4A69F',
        charcoal: '#2D2D2D',
        offwhite: '#FAFAF9',
      },
    },
  },
  plugins: [],
};
