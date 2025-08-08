# Webpack 5 example

This is a [Webpack](https://webpack.js.org/) project with a minimal React configuration.

## Getting Started

First, run the development server:

```bash
yarn install
yarn dev
```

Open [http://localhost:8080](http://localhost:8080) with your browser to see the result.

style-macro and React Spectrum - Spectrum 2 have been added to `src/App.js` to show an example of a Spectrum 2 styled component. This file does client side rendering. The page auto-updates as you edit the file.

## Macros config

Edit the webpack.config.js to add an import for the plugin and add a webpack config that adds the webpack version of the macros plugin. An empty config file would be updated to look like the following.

```
const macros = require("unplugin-parcel-macros");

module.exports = {
  // ...
  plugins: [
    // ...
    macros.webpack(),
    // ...
  ],
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
