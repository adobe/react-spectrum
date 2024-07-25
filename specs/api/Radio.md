<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

# Radio

```typescript
interface RadioGroup extends ValueBase<string>, InputBase, Labelable, DOMProps, StyleProps {
  orientation?: 'horizontal' | 'vertical', // default vertical
  labelPosition?: 'side' | 'bottom', // default side
  children: ReactElement<Radio> | ReactElement<Radio>[],
  name?: string, // HTML form name. Not displayed.
  isEmphasized?: boolean
}

interface Radio extends FocusableProps, DOMProps, StyleProps {
  value: string, // HTML form value. Not displayed.
  children?: ReactNode, // pass in children to render label
  'aria-label'?: string, // if no children, aria-label is required
  isDisabled?: boolean
}
```

## RadioGroup Changes
| **v2**                 | **v3**                         | **Notes** |
| ---------------------- | ------------------------------ | --------- |
| `labelsBelow`          | `labelPosition="bottom"`       |           |
| `vertical`             | `orientation="vertical"`       |           |
| `selectedValue`        | `value`                        |           |
| `defaultSelectedValue` | `defaultValue`                 |           |
| -                      | `isDisabled`                   | added     |
| -                      | `isRequired`                   | added     |
| -                      | `isReadOnly`                   | added     |
| -                      | `validationState`              | added     |
| -                      | `isEmphasized`                 | added     |
| -                      | `label`                        | added     |
| -                      | `labelPosition`                | added     |
| -                      | `labelAlign`                   | added     |
| -                      | `necessityIndicator`           | added     |

## Radio Changes
| **v2**        | **v3**       | **Notes**                                                                                                            |
| ------------- | ------------ | ----------------------------------------------------------------------------------------------------------|
| `quiet`       | -            | moved to RadioGroup `isEmphasized` property. default selected state is gray. use `isEmphasized` for blue. |
| `disabled`    | `isDisabled` |                                                                                                           |
| `required`    | -            | moved to RadioGroup                                                                                       |
| `invalid`     | -            | moved to RadioGroup                                                                                       |
| `readOnly`    | -            | moved to RadioGroup                                                                                       |
| `labelBelow`  | -            | moved to RadioGroup                                                                                       |
| `label`       | `children`   |                                                                                                           |
| `renderLabel` | -            | removed. pass no children if you don’t want to render a label.                                            |

## Packages
- `@react-stately/radio`
- `@react-aria/radio`
- `@react-spectrum/radio`
