# Button

```typescript
interface ButtonBase extends DOMProps, StyleProps, PressEvents, HoverEvents, FocusableProps {
  isDisabled?: boolean,
  elementType?: string | JSXElementConstructor<any>,
  children?: ReactNode,
  href?: string
}

interface SpectrumButtonProps extends ButtonProps {
  icon?: ReactElement,
  variant: 'cta' | 'overBackground' | 'primary' | 'secondary' | 'negative',
  isQuiet?: boolean
}

interface SpectrumActionButtonProps extends ButtonProps {
  icon?: ReactElement,
  isQuiet?: boolean,
  isSelected?: boolean,
  holdAffordance?: boolean
}

interface SpectrumLogicButtonProps extends ButtonProps {
  variant: 'and' | 'or'
}
```

## Changes
| **v2**                 | **v3**                           | **Notes**                                      |
| ---------------------- | ---------------------------------| ---------------------------------------------- |
| `variant="toggle"`     | `<ActionButton isQuiet>`         |                                                |
| `variant="quiet"`      | `variant="primary" isQuiet`      |                                                |
| `variant="minimal"`    | `variant="secondary" isQuiet`    |                                                |
| `variant="icon"`       | `icon`                           | `icon` only in Button and ActionButton         |
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

