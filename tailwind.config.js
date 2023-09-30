/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false
  },
  darkMode: ['class', '[style*="color-scheme: dark"]'],
  content: [
     './packages/react-aria-components/docs/examples/*.mdx'
   ],
  theme: {
    extend: {}
  },
  plugins: [
    require('tailwindcss-react-aria-components'),
    require('tailwindcss-animate')
  ]
}
