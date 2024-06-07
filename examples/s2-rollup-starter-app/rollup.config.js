/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

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
