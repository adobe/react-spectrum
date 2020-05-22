<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

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

