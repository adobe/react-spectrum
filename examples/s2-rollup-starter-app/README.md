# Rollup example

This is a [Rollup](https://rollupjs.org/) project bootstrapped with the [`rollup-starter-app`](https://github.com/rollup/rollup-starter-app) project template.

## Getting Started

First, run the development server:

```bash
yarn install
yarn dev
```

Open [http://localhost:5678](http://localhost:5678) with your browser to see the result.

style-macro and React Spectrum - Spectrum 2 have been added to `src/App.jsx` to show an example of a Spectrum 2 styled component. This file does client side rendering. The page auto-updates as you edit the file.

## Macros config

Edit the rollup.config.js to add an import for the plugin and add a rollup config that adds the rollup version of the macros plugin. An empty config file would be updated to look like the following.

```
import macrosPlugin from 'unplugin-parcel-macros';

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
    macrosPlugin.rollup(), // added for style macros, has to be before babel
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
```

To use the spectrum-theme via macros, pass your styles object to the style() macro and set the result as a new function. This new function or style() should be used within a `className` prop to style your html elements. Use the `styles` prop on React Spectrum components.

```jsx
<div className={style({marginStart: 16})}>
  Hello Spectrum 2!
</div>
```

```jsx
<Button styles={style({marginStart: 16})}>
  Hello Spectrum 2!
</Button>
```

## Application setup

Please include the page level CSS in the root of your application to configure and support the light and dark themes.

```
import "@react-spectrum/s2/page.css";
```
