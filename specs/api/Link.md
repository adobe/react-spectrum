<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

# Link

```typescript
interface Link extends DOMProps, StyleProps, PressEvents {
  variant?: 'primary' | 'secondary' | 'overBackground', // default primary
  children: ReactNode,
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

## Example
    // If only text, then we will wrap in a span with the spectrum class.
    // Otherwise, we will clone the element and add the class/event handlers.
    <Link>Hello</Link>
    <Link><a href="pdofj">Hello</a></Link>
    <Link><GatsbyLink to="oidhjf">dpofjd</GatsbyLink></Link>

