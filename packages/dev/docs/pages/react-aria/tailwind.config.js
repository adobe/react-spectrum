const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    relative: true,
    files: ['*.mdx', 'home/*.tsx', '../../../../../starters/tailwind/**/*.{ts,tsx}']
  },
  theme: {
    extend: {}
  },
  future: {
    hoverOnlyWhenSupported: true
  },
  plugins: [
    require('tailwindcss-react-aria-components'),
    require('tailwindcss-animate'),
    plugin(({addVariant, addUtilities}) => {
      // https://github.com/tailwindlabs/tailwindcss/pull/11694
      addVariant('forced-colors', '@media (forced-colors: active)');
      // https://github.com/tailwindlabs/tailwindcss/pull/11931
      addUtilities({
        '.forced-color-adjust-auto': {'forced-color-adjust': 'auto'},
        '.forced-color-adjust-none': {'forced-color-adjust': 'none'}
      });
    })
  ]
};
