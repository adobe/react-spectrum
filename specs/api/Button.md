# Button

```typescript
interface ButtonBase extends DOMProps, StyleProps, PressProps, FocusableProps {
  isDisabled?: boolean,
  icon?: ReactElement,
  children?: ReactNode,
  elementType?: string | JSXElementConstructor<any>,
  href?: string
}

interface Button extends ButtonBase {
  variant: 'cta' | 'overBackground' | 'primary' | 'secondary' | 'negative',
  isQuiet?: boolean
}

interface ActionButton extends ButtonBase {
  isQuiet?: boolean,
  isSelected?: boolean,
  holdAffordance?: boolean,
  isEmphasized?: boolean
}

interface LogicButton extends ButtonBase {
  variant: 'and' | 'or'
}
```

## Changes
| **v2**                 | **v3**                           | **Notes**                                      |
| ---------------------- | ---------------------------------| ---------------------------------------------- |
| `variant="toggle"`     | `<ActionButton isQuiet>`         |                                                |
| `variant="quiet"`      | `variant="primary" isQuiet`      |                                                |
| `variant="minimal"`    | `variant="secondary" isQuiet`    |                                                |
| `variant="icon"`       | `<ActionButton isQuiet>`         |                                                |
| `variant="dropdown"`   | -                                | unsupported                                    |
| `variant="clear"`      | -                                | internal                                       |
| `variant="field"`      | -                                | internal                                       |
| `variant="and"`        | `<LogicButton variant="and">`    |                                                |
| `variant="or"`         | `<LogicButton variant="or">`     |                                                |
| `variant="action"`     | `<ActionButton>`                 |                                                |
| `variant="tool"`       | -                                | REMOVED                                        |
| `quiet`                | `isQuiet`                        |                                                |
| `invalid`              | -                                | unused, only field button                      |
| `label`                | `children`                       |                                                |
| `element`              | `elementType`                    |                                                |
| `block`                | -                                | removed                                        |
| `disabled`             | `isDisabled`                     |                                                |
| `onClick`              | `onPress`                        | mobile. `onClick` will emit a console warning. |
| -                      | `isEmphasized`                   | added for `Tool`                               |

