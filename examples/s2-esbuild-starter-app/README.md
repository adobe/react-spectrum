# Esbuild example

This is a [Esbuild](https://esbuild.github.io/) project.

## Getting Started

First, run the development server:

```bash
yarn install
yarn start
python -m http.server
```

Open [http://localhost:8000/index.html](http://localhost:8000/index.html) with your browser to see the result.

style-macro and React Spectrum - Spectrum 2 have been added to `src/app.tsx` to show an example of a Spectrum 2 styled component. You'll need to re-run yarn start and refresh the page to see updates. There are many ways to start an esbuild hmr server, you can google for those.

## Macros config

Edit the settings.mjs to add an import for the plugin and add the plugin to `plugins` as the first one.

```
import macrosPlugin from 'unplugin-parcel-macros';
...
  plugins: [
    macrosPlugin.esbuild(),
    esbuildPluginTsc({
      force: true
    }),
  ]
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
