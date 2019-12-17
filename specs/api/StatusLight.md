# StatusLight

```typescript
interface StatusLight extends StyleProps, DOMProps{
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

