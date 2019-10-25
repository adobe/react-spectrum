# Pagination

```javascript
interface PaginationBase extends ValueBase<number> {
  maxValue: number,
  onPrevious?: (value: number, e: Event) => void,
  onNext?: (value: number, e: Event) => void,
  isDisabled?: boolean
}

interface PaginationButton extends Button, PaginationBase {}
interface PaginationList extends PaginationBase {}
interface PaginationField extends PaginationBase {}
```
## Changes
| **v2**                     | **v3**                  | **Notes**                  |
| -------------------------- | ----------------------- | -------------------------- |
| `variant="button"`         | `<PaginationButton>`    |                            |
| `variant="explicit"`       | `<PaginationField>`     |                            |
| -                          | `<PaginationList>`      | added                      |
| `mode`                     | `variant`               | only on `PaginationButton` |
| `currentPage`              | `value`                 |                            |
| `defaultPage`              | `defaultValue`          |                            |
| `totalPages`               | `maxValue`              |                            |
| -                          | `isDisabled`            | added                      |

## Packages
- `@react-spectrum/pagination`
- `@react-aria/pagination`
- `@react-stately/pagination`
