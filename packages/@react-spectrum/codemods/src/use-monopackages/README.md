# Codemod for using React Spectrum monopackages

Replaces individual package imports with monopackage imports, where possible.

Works for:
- `@react-spectrum/*` -> `@adobe/react-spectrum`.
- `@react-aria/*` -> `react-aria`.
- `@react-stately/*` -> `react-stately`.

By default this will apply to all the above packages, or optionally you can specify which packages to apply this by passing a comma-separated list to the packages option: `--packages=react-aria,react-stately,react-spectrum`.

Run this from a directory where the relevant packages are installed in node_modules so it knows which monopackage exports are available to use (since exports may vary by version).

## Usage

Run `npx @react-spectrum/codemods use-monopackages` from the directory you want to update imports in.

### Options

- `--packages` - A comma-separated list of packages to apply this to. Defaults to all packages.
- `--parser` - The [parser](https://github.com/facebook/jscodeshift?tab=readme-ov-file#parser) to use for parsing the source files. Defaults to `tsx`.
- `--ignore-pattern` - A [glob pattern](https://github.com/facebook/jscodeshift?tab=readme-ov-file#ignoring-files-and-directories) of files to ignore. Defaults to `**/node_modules/**`.
- `--dry` - Run the codemod without making changes to the files.
- `--path` - The path to the directory to run the codemod in. Defaults to the current directory.

