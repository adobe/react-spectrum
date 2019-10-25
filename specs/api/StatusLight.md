# StatusLight

```javascript
interface StatusLight {
  children: ReactNode,
  variant: 'positive' | 'negative' | 'notice' | 'info' | 'neutral' | 'celery' | 'chartreuse' | 'yellow' | 'magenta' | 'fuchsia' | 'purple' | 'indigo' | 'seafoam',
  isDisabled?: boolean
}
```
## Changes
| **v2**                   | **v3**                  | **Notes** |
| ------------------------ | ----------------------- | --------- |
| `variant="active"`       | `variant="info"`        |           |
| `variant="archived"`     | `variant="neutral"`     |           |

## Packages
- `@react-spectrum/statuslight`

