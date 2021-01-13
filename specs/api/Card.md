<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

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

