import commonjs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import css from 'rollup-plugin-import-css';
import macros from 'unplugin-parcel-macros';
import reactSvg from "rollup-plugin-react-svg";

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  output: {
    file: 'public/bundle.js',
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    sourcemap: true
  },
  plugins: [
    nodeResolve({
      extensions: ['.js', '.jsx', '.mjs']
    }), // from https://www.codeguage.com/blog/setup-rollup-for-react
    macros.rollup(), // added for style macros, has to be before babel
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-react'],
      extensions: ['.js', '.jsx']
    }), // from https://www.codeguage.com/blog/setup-rollup-for-react
    commonjs(), // converts date-fns to ES modules
    replace({
      preventAssignment: false,
      'process.env.NODE_ENV': '"development"'
    }), // from https://www.codeguage.com/blog/setup-rollup-for-react
    css({
      output: 'bundle.css'
    }), // added to bundle React Spectrum's Spectrum 2 css
    reactSvg(), // added for illustration svg's
    production && terser() // minify, but only in production
  ]
};
