# Checkbox and Switch

```typescript
interface CheckboxBase {
  children?: ReactNode, // pass in children to render label
  'aria-label'?: string, // if no children, aria-label is required

  defaultSelected?: boolean,
  isSelected?: boolean,
  onChange?: (isSelected: boolean) => void, //Possibly add native event as arg?

  /* Cannot use InputProps because value is a
  valid dom prop for input as well as checked */
  value?: string, // dom prop for input element
  name?: string,
  isEmphasized?: boolean
}

interface CheckboxProps {
  isIndeterminate?: boolean
}

interface SwitchProps extends CheckboxBase {}
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
