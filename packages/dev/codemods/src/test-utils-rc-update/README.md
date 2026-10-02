# Codemod for @react-aria/test-utils RC API update

Updates test files that use the `@react-aria/test-utils` or `@react-spectrum/test-utils` testers when upgrading the test utils from beta to RC. This updates your tests to use the
renamed getters alongside other changes.

```diff
- tester.listbox;
+ tester.getListbox();

- tester.options();
+ tester.getOptions();

- await tester.selectOption({option: 'Save'});
+ await tester.toggleOptionSelection({option: 'Save'});

- tester.findOption({optionIndexOrText: 'Save'});
+ tester.findOption({indexOrText: 'Save'});
```

Handles all tester types: `ListBox`, `ComboBox`, `Select`, `Menu`, `Table`, `GridList`, `Tree`, `Tabs`, `RadioGroup`, `CheckboxGroup`, and `Dialog`.

## Usage

Run `npx @react-spectrum/codemods test-utils-rc-update` from the directory you want to update test files in.

### Options

- `--ignore-pattern` - A [glob pattern](https://github.com/facebook/jscodeshift?tab=readme-ov-file#ignoring-files-and-directories) of files to ignore. Defaults to `**/node_modules/**`.
- `--dry` - Run the codemod without making changes to the files.
- `--path` - The path to the directory to run the codemod in. Defaults to the current directory.
