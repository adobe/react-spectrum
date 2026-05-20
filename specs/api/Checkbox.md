<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

# Checkbox and Switch

```typescript
interface CheckboxBase extends InputBase {
  children?: ReactNode, // pass in children to render label
  'aria-label'?: string, // if no children, aria-label is required

  defaultSelected?: boolean,
  isSelected?: boolean,
  onChange?: (isSelected: boolean) => void, //Possibly add native event as arg?

  /* Cannot use InputProps because value is a
  valid dom prop for input as well as checked */
  value?: string, // dom prop for input element
  name?: string,
  isEmphasized?: boolean
}

interface Checkbox extends CheckboxBase {
  isIndeterminate?: boolean
}

interface Switch extends CheckboxBase {}
```

## Changes
| **v2**               | **v3**                            | **Notes**                                                                             |
| -------------------- | --------------------------------- | ------------------------------------------------------------------------------------- |
| `quiet`              | -                                 | removed. selected state is now gray by default. use `isEmphasized` to make them blue. |
| -                    | `isEmphasized`                    | added                                                                                 |
| `disabled`           | `isDisabled`                      |                                                                                       |
| `required`           | `isRequired`                      |                                                                                       |
| `invalid`            | `validationState="invalid"`       |                                                                                       |
| `readOnly`           | `isReadOnly`                      |                                                                                       |
| `checked`            | `isSelected`                      |                                                                                       |
| `defaultChecked`     | `defaultSelected`                 |                                                                                       |
| `indeterminate`      | `isIndeterminate`                 |                                                                                       |
| `label`              | `children`                        |                                                                                       |
| `renderLabel`        | -                                 | removed. pass no children if you don’t want to render a label.                        |
| `variant="ab"`       | -                                 | removed.                                                                              |
