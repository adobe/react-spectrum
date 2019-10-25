# Avatar

```typescript
interface Avatar {
  src: string,
  alt?: string,
  size?: 'S' | 'M' | 'L',
  isDisabled?: boolean
}

interface AvatarGroup {
  children: ReactElement<Avatar>[],
  isDisabled?: boolean,
  onOverflowClick?: () => void,
  orientation?: 'horizontal' | 'vertical',
  shouldExpand?: boolean,
  overflowMode?: 'remaining' | 'total',
  size?: 'S' | 'M' | 'L',
  stackTop?: boolean,
  visibleItems?: number
}

interface AvatarGroupOverflow {
  children?: ReactNode
}
```

## Changes
| **v2**     | **v3**       | **Notes**
| ---------- | ------------ | -----
| -          | `size`       | Added
| `disabled` | `isDisabled` |

