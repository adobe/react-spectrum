<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

# DatePicker, Calendar, TimePicker

```javascript
type DateValue = string | number | Date;
interface DatePickerBase extends InputBase {
  minValue?: DateValue,
  maxValue?: DateValue,
  formatOptions?: Intl.DateTimeFormatOptions,
  placeholderDate?: DateValue,
  isQuiet?: boolean,
  hideCalendar?: boolean
}

interface DatePicker extends DatePickerBase, ValueBase<DateValue> {}

type DateRange = RangeValue<DateValue>;
interface DateRangePicker extends DatePickerBase, ValueBase<DateRange> {}

interface CalendarBase {
  minValue?: DateValue,
  maxValue?: DateValue,
  isDisabled?: boolean,
  isReadOnly?: boolean,
  autoFocus?: boolean
}

interface Calendar extends CalendarBase, ValueBase<DateValue> {}
interface RangeCalendar extends CalendarBase, ValueBase<DateRange> {}
```

## DatePicker Changes
| **v2**                        | **v3**                      | **Notes**                       |
| ----------------------------- | --------------------------- | ------------------------------- |
| `<Datepicker>`                | `<DatePicker>`              |                                 |
| `quiet`                       | `isQuiet`                   |                                 |
| `disabled`                    | `isDisabled`                |                                 |
| `required`                    | `isRequired`                |                                 |
| `invalid`                     | `validationState="invalid"` |                                 |
| `readOnly`                    | `isReadOnly`                |                                 |
| `selectionType="range"`       | `<DateRangePicker>`         |                                 |
| `placement`                   | -                           | removed                         |
| `displayFormat`               | `formatOptions`             | use Intl API for internationalized date formatting instead of moment. |
| `headerFormat`                | -                           | removed.                        |
| `valueFormat`                 | -                           | removed. pass a parsed Date object, a date string in ISO format, or a UNIX timestamp.|
| `min`                         | `minValue`                  |                                 |
| `max`                         | `maxValue`                  |                                 |
| `placeholder`                 | `placeholderDate`           | added                           |

## Calendar Changes
| **v2**                  | **v3**                      | **Notes**                                                                             |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------------------- |
| `disabled`              | `isDisabled`                |                                                                                       |
| `required`              | `isRequired`                |                                                                                       |
| `invalid`               | `validationState="invalid"` |                                                                                       |
| `readOnly`              | `isReadOnly`                |                                                                                       |
| `selectionType="range"` | `<RangeCalendar>`           |                                                                                       |
| `headerFormat`          | -                           | removed.                                                                              |
| `valueFormat`           | -                           | removed. pass a parsed Date object, a date string in ISO format, or a UNIX timestamp. |
| `startDay`              | -                           | removed. Start day will be determined based on the locale of the `dateFormatter`.     |
| `min`                   | `minValue`                  |                                                                                       |
| `max`                   | `maxValue`                  |                                                                                       |

