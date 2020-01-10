# Form and Label

```typescript
interface Form extends DOMProps, StyleProps, LabelableProps {
  children: ReactElement<FormItem> | ReactElement<FormItem>[]
  isQuiet?: boolean,
  isEmphasized?: boolean,
  isDisabled?: boolean,
  isRequired?: boolean,
  isReadOnly?: boolean,
  validationState?: ValidationState
}

interface Label extends DOMProps, StyleProps {
  children?: ReactNode,
  htmlFor?: string, // for compatibility with React
  for?: string,
  labelPosition?: LabelPosition, // default top
  labelAlign?: Alignment, // default start
  isRequired?: boolean,
  necessityIndicator?: NecessityIndicator // default icon
}
```

## Form Changes
| **v2**                     | **v3**                     | **Notes**   |
| -------------------------- | -------------------------- | ----------- |
| -                          | `isQuiet`                  | added       |
| -                          | `isEmphasized`             | added       |
| -                          | `isDisabled`               | added       |
| -                          | `isRequired`               | added       |
| -                          | `isReadOnly`               | added       |
| -                          | `validationState`          | added       |

## FieldLabel Changes
| **v2**                     | **v3**                     | **Notes**             |
| -------------------------- | -------------------------- | --------------------- |
| `FieldLabel`               | `Label`                    | component name change |
| `labelAlign="left"`        | `labelAlign="start"`       | rtl support           |
| `labelAlign="right"`       | `labelAlign="end"`         | rtl support           |
| `labelFor`                 | `for`                      | internal              |
| -                          | `isRequired`               | added                 |
| -                          | `isReadOnly`               | added                 |
| -                          | `validationState`          | added                 |
| -                          | `necessityIndicator`       | added                 |
| -                          | `labelPosition`            | added                 |
