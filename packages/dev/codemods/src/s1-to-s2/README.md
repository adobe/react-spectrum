# React Spectrum Upgrade Assistant

A CLI tool for upgrading React Spectrum components to Spectrum 2.

## Usage

Run `npx @react-spectrum/codemods s1-to-s2` from the directory you want to upgrade.

### Options

- `-c, --components <components>`: Comma separated list of components to upgrade (ex: `Button,TableView`). If not specified, all available components will be upgraded.

## How it works

The upgrade assistant use codemods written with [jscodeshift](https://github.com/facebook/jscodeshift).

## Adding a new codemod

To add a new codemod for `Button`, for example, you would:

1. Create a new transform function in `src/codemods/components/Button/transform.ts` and export it as `default`
2. Implement the transform logic
3. Add tests for the transform in `__tests__/button.test.ts`
