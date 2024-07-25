<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

# Button

```typescript
interface ButtonBase extends DOMProps, StyleProps, PressEvents, FocusableProps {
  isDisabled?: boolean,
  elementType?: string | JSXElementConstructor<any>,
  children?: ReactNode,
  href?: string
}

interface Button extends ButtonBase {
  variant: 'cta' | 'overBackground' | 'primary' | 'secondary' | 'negative', // no default, must choose
  isQuiet?: boolean
}

interface ActionButton extends ButtonBase {
  isQuiet?: boolean,
  isSelected?: boolean,
  holdAffordance?: boolean,
  isEmphasized?: boolean
}

interface LogicButton extends ButtonBase {
  variant: 'and' | 'or'
}
```

## Changes
| **v2**                 | **v3**                           | **Notes**                                      |
| ---------------------- | ---------------------------------| ---------------------------------------------- |
| `variant="toggle"`     | `<ActionButton isQuiet>`         |                                                |
| `variant="quiet"`      | `variant="primary" isQuiet`      |                                                |
| `variant="minimal"`    | `variant="secondary" isQuiet`    |                                                |
| `variant="icon"`       | `<ActionButton isQuiet>`         |                                                |
| `variant="dropdown"`   | -                                | unsupported                                    |
| `variant="clear"`      | -                                | internal                                       |
| `variant="field"`      | -                                | internal                                       |
| `variant="and"`        | `<LogicButton variant="and">`    |                                                |
| `variant="or"`         | `<LogicButton variant="or">`     |                                                |
| `variant="action"`     | `<ActionButton>`                 |                                                |
| `variant="tool"`       | -                                | REMOVED                                        |
| `quiet`                | `isQuiet`                        |                                                |
| `invalid`              | -                                | unused, only field button                      |
| `label`                | `children`                       |                                                |
| `element`              | `elementType`                    |                                                |
| `block`                | -                                | removed                                        |
| `disabled`             | `isDisabled`                     |                                                |
| `onClick`              | `onPress`                        | mobile. `onClick` will emit a console warning. |
| -                      | `isEmphasized`                   | added for `Tool`                               |

