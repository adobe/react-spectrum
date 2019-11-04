# Menu Trigger

```typescript
interface MenuTrigger {
  children: ReactNode, // figure out if we can type the children
  trigger: 'press' | 'longPress',
  align?: 'start' | 'end',
  direction?: 'bottom' | 'top', // left right?
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void
}

```


## MenuTrigger Changes
| **v2**                  | **v3**                | **Notes**                                      |
| ----------------------- | --------------------- | ---------------------------------------------- |
| `<Dropdown>`            | `<MenuTrigger>`       |                                                |
| `onOpen`                | -                     | use `onToggle`                                 |
| `onClose`               | -                     | use `onToggle`                                 |
| -                       | `onToggle`            | added                                          |
| `alignRight`            | `align="end"`         | rtl                                            |
| `flip`                  | `shouldFlip`          |                                                |
| `trigger="click"`       | `trigger="press"`     | mobile support                                 |
| `trigger="longClick"`   | `trigger="longPress"` | mobile support                                 |
| `trigger="hover"`       | -                     | unsupported for dropdown, use `OverlayTrigger` |
| `trigger="focus"`       | -                     | unsupported for dropdown, use `OverlayTrigger` |
| -                       | `direction`           | added                                          |
| -                       | `isOpen`              | added                                          |
| -                       | `defaultOpen`         | added                                          |
| `closeOnSelect`         | -                     | removed                                        |

