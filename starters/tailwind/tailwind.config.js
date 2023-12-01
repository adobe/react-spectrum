module.exports = {
  content: ["./src/*.tsx", "./stories/*.tsx"],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-react-aria-components'),
    require('tailwindcss-animate')
  ],
};
