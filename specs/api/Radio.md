# Radio

```typescript
interface RadioGroup extends ValueBase<string>, InputBase {
  orientation?: 'horizontal' | 'vertical', // default horizontal
  labelPosition?: 'side' | 'bottom', // default side
  children: ReactElement<Radio> | ReactElement<Radio>[],
  name?: string, // HTML form name. Not displayed.
  isEmphasized?: boolean
}

interface Radio extends FocusableProps, DOMProps, StyleProps {
  value: string, // HTML form value. Not displayed.
  children?: ReactNode, // pass in children to render label
  'aria-label'?: string, // if no children, aria-label is required
  isDisabled?: boolean
}
```

## RadioGroup Changes
| **v2**                 | **v3**                         | **Notes** |
| ---------------------- | ------------------------------ | --------- |
| `labelsBelow`          | `labelPosition="bottom"`       |           |
| `vertical`             | `orientation="vertical"`       |           |
| `selectedValue`        | `value`                        |           |
| `defaultSelectedValue` | `defaultValue`                 |           |
| -                      | `isDisabled`                   | added     |
| -                      | `isRequired`                   | added     |
| -                      | `isReadOnly`                   | added     |
| -                      | `validationState`              | added     |
| -                      | `isEmphasized`                 | added     |

## Radio Changes
| **v2**        | **v3**       | **Notes**                                                                                                            |
| ------------- | ------------ | ----------------------------------------------------------------------------------------------------------|
| `quiet`       | -            | moved to RadioGroup `isEmphasized` property. default selected state is gray. use `isEmphasized` for blue. |
| `disabled`    | `isDisabled` |                                                                                                           |
| `required`    | -            | moved to RadioGroup                                                                                       |
| `invalid`     | -            | moved to RadioGroup                                                                                       |
| `readOnly`    | -            | moved to RadioGroup                                                                                       |
| `labelBelow`  | -            | moved to RadioGroup                                                                                       |
| `label`       | `children`   |                                                                                                           |
| `renderLabel` | -            | removed. pass no children if you don’t want to render a label.                                            |

## Packages
- `@react-stately/radio`
- `@react-aria/radio`
- `@react-spectrum/radio`
