/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[style*="color-scheme: dark"]'],
  content: {
    relative: true,
    files: ['*.mdx', 'home/*.tsx', '../../../../../starters/tailwind/**/*.tsx']
  },
  theme: {
    extend: {}
  },
  plugins: [
    require('tailwindcss-react-aria-components'),
    require('tailwindcss-animate')
  ]
};
