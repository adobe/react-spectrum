# React Aria Starter

Welcome to React Aria! This starter kit includes a [Storybook](https://storybook.js.org/) containing all of the examples in the docs. You can modify any of the components or their corresponding CSS files to play around or bootstrap your own component library.

To get started, run the following commands:

```shell
yarn
yarn storybook
```

## Building for Production

This starter uses [CSS Nesting](https://drafts.csswg.org/css-nesting/), which is a draft spec and not fully supported in all browsers. To support nesting in production, you can enable this feature in [Lightning CSS](https://lightningcss.dev/docs.html) or use the [PostCSS Nesting](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting#usage) plugin in your build.
