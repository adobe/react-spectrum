# Form and FieldLabel

```javascript
import {ReactElement, ReactNode} from 'react';

interface Form {
  children: ReactElement<FormItem> | ReactElement<FormItem>[]
}

export interface LabelProps extends DOMProps {
  children?: ReactNode,
  labelFor?: string,
  label?: ReactNode,
  htmlFor?: string
}

interface FieldLabelBase extends LabelProps {
  labelPosition?: 'top' | 'side',
  labelAlign?: 'start' | 'end',
  isRequired?: boolean,
  necessityIndicator?: 'icon' | 'label'
}

interface FormItem extends FieldLabelBase {}
interface FieldLabel extends FieldLabelBase {}
```

## FormItem Changes
| **v2**                     | **v3**                     | **Notes**   |
| -------------------------- | -------------------------- | ----------- |
| `labelAlign="left"`        | `labelAlign="start"`       | rtl support |
| `labelAlign="right"`       | `labelAlign="end"`         | rtl support |
| `labelFor`                 | -                          | internal    |
| -                          | `isRequired`               | added       |
| -                          | `necessityIndicator`       | added       |
| -                          | `labelPosition`            | added       |

## FieldLabel Changes
| **v2**             | **v3**                   | **Notes**   |
| ------------------ | ------------------------ | ----------- |
| `position="left"`  | `labelAlign="start"`     | rtl support |
| `position="right"` | `labelAlign="end"`       | rtl support |
| `necessity`        | `isRequired`             |             |
| -                  | `labelPosition`          | added       |
