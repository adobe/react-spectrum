<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

# Menu Trigger

```typescript
interface MenuTrigger {
  children: ReactNode, // figure out if we can type the children
  trigger: 'press' | 'longPress',
  align?: 'start' | 'end',
  direction?: 'bottom' | 'top', // left right?
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void
}

```


## MenuTrigger Changes
| **v2**                  | **v3**                | **Notes**                                      |
| ----------------------- | --------------------- | ---------------------------------------------- |
| `<Dropdown>`            | `<MenuTrigger>`       |                                                |
| `onOpen`                | -                     | use `onToggle`                                 |
| `onClose`               | -                     | use `onToggle`                                 |
| -                       | `onToggle`            | added                                          |
| `alignRight`            | `align="end"`         | rtl                                            |
| `flip`                  | `shouldFlip`          |                                                |
| `trigger="click"`       | `trigger="press"`     | mobile support                                 |
| `trigger="longClick"`   | `trigger="longPress"` | mobile support                                 |
| `trigger="hover"`       | -                     | unsupported for dropdown, use `OverlayTrigger` |
| `trigger="focus"`       | -                     | unsupported for dropdown, use `OverlayTrigger` |
| -                       | `direction`           | added                                          |
| -                       | `isOpen`              | added                                          |
| -                       | `defaultOpen`         | added                                          |
| `closeOnSelect`         | -                     | removed                                        |

