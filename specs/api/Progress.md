# ProgressBar and ProgressCircle

```javascript
import {ReactNode} from 'react';

interface ProgressBar {
  value?: number,
  minValue?: number,
  maxValue?: number,
  size?: 'S' | 'L',
  children?: ReactNode,
  'aria-label'?: string,
  labelPosition?: 'top' | 'side',
  showValueLabel?: boolean, // true by default if label, false by default if not
  formatOptions?: Intl.NumberFormatOptions, // defaults to formatting as a percentage.
  valueLabel?: ReactNode, // custom value label (e.g. 1 of 4)
  variant?: 'positive' | 'warning' | 'critical' | 'overBackground',
  isIndeterminate?: boolean
}

interface ProgressCircle {
  value?: number,
  minValue?: number,
  maxValue?: number,
  size?: 'S' | 'M' | 'L',
  variant?: 'overBackground',
  isCentered?: boolean,
  isIndeterminate?: boolean
}
```

## ProgressBar Changes
| **v2**                         | **v3**                       | **Notes**                                                       |
| ------------------------------ | ---------------------------- | --------------------------------------------------------------- |
| `<Progress>`                   | `<ProgressBar>`              |                                                                 |
| `size="M"`                     | `size="L"`                   | spectrum calls it large, not medium                             |
| `labelPosition="left"`         | `labelPosition="side"`       | rtl support                                                     |
| `labelPosition="bottom"`       | -                            | not supported.                                                  |
| `label`                        | `children`                   | if not provided, `aria-label` is required.                      |
| `showPercent`                  | `showValueLabel`             | default changed to true if label is specified, false if not.    |
| -                              | `numberFormatter`            | added. default is percentage, but others can also be supported. |
| -                              | `valueLabel`                 | custom value label, e.g. “1 of 4”                               |
| -                              | `isIndeterminate`            | added                                                           |
| `min`                          | `minValue`                   |                                                                 |
| `max`                          | `maxValue`                   |                                                                 |

## ProgressCircle Changes
| **v2**                          | **v3**             | **Notes** |
| ------------------------------- | ------------------ | --------- |
| `<Wait>`                        | `<ProgressCircle>` |           |
| `variant="indeterminate"`       | `isIndeterminate`  |           |
| `centered`                      | `isCentered`       |           |
| -                               | `minValue`         | added     |
| -                               | `maxValue`         | added     |
