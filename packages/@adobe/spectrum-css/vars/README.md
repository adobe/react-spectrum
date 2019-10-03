# `@spectrum-css/vars`

The vars component contains all the variables that drive the presentation of a component.

## CSS Usage

The files within the `css/` folder are unprocessed DNA output. These contain ALL variables with raw data for each. These should be used if variables are required at build time.

The files within the `dist/css/` folder contain processed DNA output, with references to only the DNA variables that change between color stops and scales. These should be if CSS custom properties are being used in-browser.

## JS Usage

The package exports a tree-shakable object containing all DNA variables.

```
> require('@spectrum-css/vars');
{
  dark: { ... }
  darkest: { ... }
  global: { ... }
  large: { ... }
  light: { ... }
  lightest: { ... }
  medium: { ... }
  metadata: { ... }
  middark: { ... }
  midlight: { ... }
}
```

## Updating from DNA

To update from DNA:

1. Update the DNA version in `package.json`, if necesssary
1. Make sure you've executed `npm install` in the root of the project within the Adobe network so `node_modules/@spectrum/spectrum-dna` is present
1. Run `npm run update`
1. Commit the new files with `git add .; git commit -m "Update DNA"`
