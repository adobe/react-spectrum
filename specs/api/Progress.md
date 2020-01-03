# ProgressBar, Meter, and ProgressCircle

```typescript
interface ProgressBar {
  value?: number,
  minValue?: number,
  maxValue?: number,
  size?: 'S' | 'L',
  label?: ReactNode,
  'aria-label'?: string,
  labelPosition?: 'top' | 'side',
  showValueLabel?: boolean, // true by default if label, false by default if not
  formatOptions?: Intl.NumberFormatOptions, // defaults to formatting as a percentage.
  valueLabel?: ReactNode, // custom value label (e.g. 1 of 4)
  variant?: 'overBackground',
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

interface Meter extends ProgressBar {
  variant: 'positive' | 'warning' | 'critical'
}
```

## ProgressBar Changes
| **v2**                         | **v3**                       | **Notes**                                                       |
| ------------------------------ | ---------------------------- | --------------------------------------------------------------- |
| `<Progress>`                   | `<ProgressBar>`              |                                                                 |
| `size="M"`                     | `size="L"`                   | spectrum calls it large, not medium                             |
| `labelPosition="left"`         | `labelPosition="side"`       | rtl support                                                     |
| `labelPosition="bottom"`       | -                            | not supported.                                                  |
| `showPercent`                  | `showValueLabel`             | default changed to true if label is specified, false if not.    |
| -                              | `numberFormatter`            | added. default is percentage, but others can also be supported. |
| -                              | `valueLabel`                 | custom value label, e.g. “1 of 4”                               |
| -                              | `isIndeterminate`            | added                                                           |
| `min`                          | `minValue`                   |                                                                 |
| `max`                          | `maxValue`                   |                                                                 |
| `variant="positive"`           | `<Meter variant="positive">` |                                                                 |
| `variant="warning"`            | `<Meter variant="warning">`  |                                                                 |
| `variant="critical"`           | `<Meter variant="critical">` |                                                                 |

## ProgressCircle Changes
| **v2**                          | **v3**             | **Notes** |
| ------------------------------- | ------------------ | --------- |
| `<Wait>`                        | `<ProgressCircle>` |           |
| `variant="indeterminate"`       | `isIndeterminate`  |           |
| `centered`                      | `isCentered`       |           |
| -                               | `minValue`         | added     |
| -                               | `maxValue`         | added     |
