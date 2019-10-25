# Text Fields

```typescript
interface TextField extends InputBase, TextInputBase, ValueBase<string> {
  icon?: ReactNode,
  isQuiet?: boolean,
  validationTooltip?: ReactNode
}

type TextArea = TextField;

interface SearchField extends TextField {
  onSubmit?: (value: string, e?: Event) => void,
  onClear? () => void
}

interface NumberField extends InputBase, TextInputBase, ValueBase<number>, RangeInputBase<number> {
  isQuiet?: boolean,
  decrementAriaLabel?: string,
  incrementAriaLabel?: string,
  showStepper?: boolean,
  formatOptions?: Intl.NumberFormatOptions
}

interface SearchWithin extends InputBase, TextInputBase {
  // not extending from ValueBase because we want onValueChange instead of onChange
  value?: string,
  defaultValue?: string,
  onValueChange: (value: string, e: Event) => void,
  onSubmit: (value: string) => void,

  scope?: string,
  defaultScope?: string,
  onScopeChange: (scope: string) => void,
  children: ReactElement<MenuItem> | ReactElement<MenuItem>[],
}

// should this contain a textfield or other input instead of specifically being a textfield?
interface InlineEditor extends TextField {
  onCancel?: () => void
}
```


## Changes (all)
| **v2**        | **v3**                      | **Notes** |
| ------------- | --------------------------- | --------- |
| `<Textfield>` | `<TextField>`               |           |
| `<Textarea>`  | `<TextArea>`                |           |
| `quiet`       | `isQuiet`.                  |           |
| `disabled`    | `isDisabled`                |           |
| `required`    | `isRequired`                |           |
| `invalid`     | `validationState="invalid"` |           |
| `readOnly`    | `isReadOnly`                |           |
| -             | `icon`                      | added     |
| -             | `validationTooltip`         | added     |

## SearchField Changes
| **v2**                                     | **v3**                  | **Notes**                                        |
| ------------------------------------------ | ----------------------- | ------------------------------------------------ |
| `<Search>`                                 | `<SearchField>`         |                                                  |
| `onChange(value, e, {from})` (search only) | `onChange(value, e)`    | removed `from` parameter. use `onClear` instead. |
| -                                          | `onClear` (search only) | added                                            |
| `icon`                                     | -                       | moved to TextField                               |

## NumberField Changes
| **v2**           | **v3**               | **Notes** |
| ---------------- | -------------------- | --------- |
| `<NumberInput>`  | `<NumberField>`      |           |
| `min`            | `minValue`           |           |
| `max`            | `maxValue`           |           |
| `decrementTitle` | `decrementAriaLabel` |           |
| `incrementTitle` | `incrementAriaLabel` |           |
| -                | `showStepper`        | added     |
| -                | `formatOptions`      | added     |

## SearchWithin Changes
| **v2**         | **v3**     | **Notes** |
| -------------- | ---------- | --------- |
| `scopeOptions` | `children` |           |
