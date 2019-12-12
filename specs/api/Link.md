# Link

```typescript
interface Link extends DOMProps, StyleProps, PressProps {
  variant?: 'primary' | 'secondary' | 'overBackground', // default primary
  children: ReactNode,
  isQuiet?: boolean
}
```

## Changes
| **v2**                   | **v3**                  | **Notes**                               |
| ------------------------ | ----------------------- | --------------------------------------- |
| `subtle`                 | `variant="quiet"`       | already deprecated                      |
| `variant="subtle"`       | `variant="quiet"`       | already deprecated                      |
| `href`                   | -                       | removed. add a link element as children |
| `target`                 | -                       | removed. add a link element as children |
| `onClick`                | `onPress`               |                                         |
|                          |                         |                                         |

## Packages
- `@react-aria/link`
- `@react-spectrum/link`

## Example
    // If only text, then we will wrap in a span with the spectrum class.
    // Otherwise, we will clone the element and add the class/event handlers.
    <Link>Hello</Link>
    <Link><a href="pdofj">Hello</a></Link>
    <Link><GatsbyLink to="oidhjf">dpofjd</GatsbyLink></Link>

