/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  presets: [
    require('./src/spectrum-preset.js')
  ],
}
