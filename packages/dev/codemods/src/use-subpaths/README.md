# Codemod to use subpath exports

Replaces monopackage imports with subpaths.

```diff
- import {Button} from 'react-aria-components';
+ import {Button} from 'react-aria-components/Button';
```

## Usage

Run `npx @react-spectrum/codemods use-subpaths` from the directory you want to update imports in.

### Options

- `--parser` - The [parser](https://github.com/facebook/jscodeshift?tab=readme-ov-file#parser) to use for parsing the source files. Defaults to `tsx`.
- `--ignore-pattern` - A [glob pattern](https://github.com/facebook/jscodeshift?tab=readme-ov-file#ignoring-files-and-directories) of files to ignore. Defaults to `**/node_modules/**`.
- `--dry` - Run the codemod without making changes to the files.
- `--path` - The path to the directory to run the codemod in. Defaults to the current directory.
