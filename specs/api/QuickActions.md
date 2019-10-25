# QuickActions

```javascript
interface QuickActions {
  variant?: 'icon' | 'text',
  maxVisibleItems?: number,
  children: ReactElement<QuickActionsItem> | ReactElement<QuickActionsItem>[]
}

interface QuickActionsItem {
  children: ReactNode, // label. In icon variant this is displayed as a tooltip.
  icon?: ReactNode,
  isDisabled?: boolean,
  onPress?: (e: Event) => void
}
```
## Changes

 **v2**  | **v3**     | **Notes**
 ------- | ---------- | ---------
 `label` | `children` |

