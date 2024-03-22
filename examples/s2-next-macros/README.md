This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Pre start


You'll need to build S2 (`@react/experimental-s2`) for the link this app uses to work.

```bash
yarn build
```

## Getting Started

First, run the development server:

```bash
yarn install
yarn dev
```

Open [http://localhost:3456](http://localhost:3456) with your browser to see the result.

style-macro and React Spectrum - Spectrum 2 have been added to `src/app/page.tsx` to show an example of many of the Spectrum 2 styled components. This file does client side rendering. The page auto-updates as you edit the file.

The layout.tsx was kept from the default install and the globals.css was updated with some application specific CSS, like setting height, margin, padding, and centering content. All other files were deleted.

## Macros config

Edit the next.config.mjs to add an import for the plugin and add a webpack config that adds the webpack version of the macros plugin. An empty config file would be updated to look like the following.

```
import macrosPlugin from 'unplugin-parcel-macros';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, {}) {
    config.plugins.push(macrosPlugin.webpack());

    return config;
  }
};

export default nextConfig;
```

To use the spectrum-theme via macros, pass your styles object to the style() macro and set the result as a new function. This new function or style() should be used within a className prop to style your html elements. Use the styles prop on React Spectrum components.

In the page.tsx file this is done inline via the className prop to create three columns of components, the buttons and dialogs, the form elements, and inline alerts. The following is the outer wrapper for these columns with CSS defined via Styles.

```
<div className={style({display: 'flex', flexDirection: 'row', alignItems: 'start', gap: 4 })}>
```

## Application setup

Please include the page level CSS in the root of your application to configure and support the light and dark themes.

```
import "@react/experimental-s2/page.css";
```

## S2

This app currently exists within the S2 repo as an example app and links to the built version directly via package.json. The spectrum-theme is also accessed via this link.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
