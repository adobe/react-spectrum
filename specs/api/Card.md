# Card

```typescript
interface Card {
  variant?: 'quiet' | 'gallery', // Change to layout names instead?
  size?: 'L' | 'S',
  allowsSelection?: boolean,
  isSelected?: boolean,
  onSelectionChange?: (isSelected: boolean) => void,
  quickActions?: ReactElement<QuickActions>,
  actionMenu?: ReactElement<ActionMenu>
}

interface CardCoverPhoto {
  src: string,
  children?: ReactNode
}

interface CardPreview {
  children: ReactNode
}

interface CardBody {
  title?: ReactNode,
  subtitle?: ReactNode,
  description?: ReactNode
}

interface CardFooter {
  children: ReactNode
}
```

## Card Changes
 **v2**                     | **v3**       | **Notes**
 -------------------------- | ------------ | -----------------------
 `variant="standard"`       | -            | standard is the default
 `selected`                 | `isSelected` |

## CardBody Changes
 v2                       | **v3**                      | **Notes**
 ------------------------ | --------------------------- | -----
 `title` → `string`       | `title` → `ReactNode`       |
 `subtitle` → `string`    | `subtitle` → `ReactNode`    |
 `description` → `string` | `description` → `ReactNode` |

