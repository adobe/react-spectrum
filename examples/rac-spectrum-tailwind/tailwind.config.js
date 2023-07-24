import lightTheme from './themes/light';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
     "./src/**/*.{html,js,ts,jsx,tsx}",
   ],
  theme: {
    extend: {
      ...lightTheme
    },
  },
  plugins: [
    require("tailwindcss-animate")
  ],
}
