# style-macro-chrome-plugin

This is a chrome plugin to assist in debugging the styles applied by our Style Macro.

## Local development

From the root of our monopackage, run

```
yarn
yarn workspace style-macro-chrome-plugin start
```

This will create a dist directory in the directory `packages/dev/style-macro-chrome-plugin` which will update anytime the code changes and results in a rebuild.

Next, open Chrome and go to [chrome://extensions/](chrome://extensions/).

Load an unpacked extension, it's a button in the top left, and navigate to the dist directory.

The extension is now registered in Chrome and you can go to storybook or docs, wherever you are working.

Inspect an element on the page to open dev tools and go to the Style Macro panel.

## Troubleshooting

If the panel isn't updating with styles, try closing the dev tools and reopening it.

If the extension doesn't appear to have the latest code, try closing the dev tools and reopening it.

## ToDos

- [ ] Work with RSC
- [ ] Would be pretty cool if we could match a style condition to trigger it, like hover
- [ ] Eventually add to https://github.com/astahmer/atomic-css-devtools ??
- [ ] Our own UI
- [ ] Filtering
- [ ] Resolve css variables inline
- [ ] Link to file on the side instead of grouping by filename?
- [ ] Add classname that is applying style?
- [ ] Work in MFE's
