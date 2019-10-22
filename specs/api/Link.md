# Link

```javascript
interface Link {
  variant?: 'primary' | 'secondary' | 'overBackground',
  children: ReactNode,
  onPress?: (e: MouseEvent) => void,
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

## To Do
[x] Should we match breadcrumbs and use children as the link, and just apply the spectrum class?
[x] react-aria? maybe for role props for custom element types? could also use in button.
[x] Can over background be combined with quiet? -yes
[x] Is standard really emphasized?
[x] Available in no underline and not blue but hover is darker and underlined
[x] primary/secondary with isQuiet
[x] isQuiet removes underline
[x] Over background keeps the underline always? - no

## Example
    // If only text, then we will wrap in a span with the spectrum class.
    // Otherwise, we will clone the element and add the class/event handlers.
    <Link>Hello</Link>
    <Link><a href="pdofj">Hello</a></Link>
    <Link><GatsbyLink to="oidhjf">dpofjd</GatsbyLink></Link>

