# Checkbox and Switch

```typescript
interface CheckboxBase extends InputBase {
  children?: ReactNode, // pass in children to render label

  defaultSelected?: boolean,
  isSelected?: boolean,
  onChange?: (isSelected: boolean) => void,
  value?: string, // dom prop for input element
  name?: string
}

interface CheckboxProps extends CheckboxBase {
  isIndeterminate?: boolean
}

interface SpectrumCheckboxProps extends CheckboxProps, DOMProps, StyleProps {
  isEmphasized?: boolean
}

type SwitchProps = CheckboxBase
interface SpectrumSwitchProps extends SwitchProps, DOMProps, StyleProps {
  isEmphasized?: boolean
}
```

## Changes
| **v2**               | **v3**                            | **Notes**                                                                             |
| -------------------- | --------------------------------- | ------------------------------------------------------------------------------------- |
| `quiet`              | -                                 | removed. selected state is now gray by default. use `isEmphasized` to make them blue. |
| -                    | `isEmphasized`                    | added                                                                                 |
| `disabled`           | `isDisabled`                      |                                                                                       |
| `required`           | `isRequired`                      |                                                                                       |
| `invalid`            | `validationState="invalid"`       |                                                                                       |
| `readOnly`           | `isReadOnly`                      |                                                                                       |
| `checked`            | `isSelected`                      |                                                                                       |
| `defaultChecked`     | `defaultSelected`                 |                                                                                       |
| `indeterminate`      | `isIndeterminate`                 |                                                                                       |
| `label`              | `children`                        |                                                                                       |
| `renderLabel`        | -                                 | removed. pass no children if you don’t want to render a label.                        |
| `variant="ab"`       | -                                 | removed.                                                                              |
