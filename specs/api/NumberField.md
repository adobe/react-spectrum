<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

# Text Fields

```typescript
interface NumberField extends InputBase, TextInputBase, ValueBase<number>, RangeInputBase<number>, Labelable, DOMProps, StyleProps {
  isQuiet?: boolean,
  decrementAriaLabel?: string,
  incrementAriaLabel?: string,
  hideStepper?: boolean,
  formatOptions?: Intl.NumberFormatOptions
}

## NumberField Changes
| **v2**           | **v3**               | **Notes** |
| ---------------- | -------------------- | --------- |
| `<NumberInput>`  | `<NumberField>`      |           |
| `min`            | `minValue`           |           |
| `max`            | `maxValue`           |           |
| `decrementTitle` | `decrementAriaLabel` |           |
| `incrementTitle` | `incrementAriaLabel` |           |
| -                | `hideStepper`        | added     |
| -                | `formatOptions`      | added     |
```

#### Implementation details:
We need to support many different locales, so we can’t use parseFloat/Number() which will only work with specific locales.
Instead, we should try starting from parsing like this https://observablehq.com/@mbostock/localized-number-parsing,
it should be able to handle Arabic numbers as well as a few others that we support.
This can also help us figure out the allowed character set for a given locale.
If we only specify the pattern `[0-9]`, we miss the Arabic numerals, as this talks about https://stackoverflow.com/questions/56011682/how-to-type-both-english-and-arabic-number-inside-html-text-field-with-type-numb.
We should handle the parsing in stately. We could possibly create a hook to do the opposite of our `useNumberFormatter` instead of a class like the above link has.
Maybe `useNumberParser`?

To add units/currency to the value, we should pass that through the options for `useNumberFormatter`,
which handles putting things in the right place automatically based on the locale.
If a user needs to change the unit or the currency, then we should provide a `Select` or some other input.
If we try to do it in the string itself, it’ll get complicated to parse since it can be in different places or may have different lengths of characters.
It’d also complicate the pattern that we’d specify for the input.
We should be able to do this in `useNumberFieldState`, which can return both the number `value` and the string `textValue` for use in the component.

We’d like to have the input and output of the `NumberField` be a number as this is the likely value type that will be stored in a database, not a string representation.
If a consumer of our library needs the formatted string version of the value, they can pass the value from `onChange` through  `useNumberFormatter` with the same options that they pass into `NumberField` and they should get the same string that is being displayed in the input.

#### Example Behavior
In an uncontrolled NumberField with `defaultValue` of 50 and style `percent`, when a user focuses, the entire text should be selected, so that the user can begin typing a new number.
They type `34.56`, we fire onChange only on a blur.
Only characters that are valid numerals or separators can be typed, other keys like letters are ignored.
When they blur, the `%` reappears after formatting according to the `formatOptions` again. The user should be able to type any valid symbols that the formatter would add.

If they typed something invalid (invalid combination of valid characters) at any point, we fail to parse it into parts,
then we do not set the state to that value and we do not fire `onChange`.
This should prevent us from re-rendering so they could still change it to something valid.
If they blur while it’s invalid, we haven’t updated the state with anything invalid, so we just format and display that value.

#### More notes:
We shouldn’t restrict people to a numeral system and we should retain the users numeral system, but format based on the locale.
To do this, detect the locale entered using character mapping to https://github.com/unicode-org/cldr/blob/master/common/supplemental/numberingSystems.xml
Determine what assumptions are valid with this, if the user starts entering Arabic numerals and then starts entering Latin, what do we do.
See if we can keep things like currency symbols from the formatter in the textfield the entire time.
Can we ignore any invalid characters? use [pattern]?
Input mode should go to numberpad in mobile, how can we do this best? other numeral systems? what about minus signs

##### Future considerations:
Large number formatting? Million is M in English, but Mo in French

