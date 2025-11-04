<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2025-04-09
- RFC PR:
- Authors: @AndrewLeedham

# Number Field Stepping

## Summary

The step option for number fields limits decimal places of the saved value, that is to say you cannot increment/decrement by a different precision that the value is stored.

## Motivation

Certain values (especially in science based domains) may want to be displayed with say 4 decimal places, but incrementing/decrementing by 0.0001 is too fine-grained, something like 0.1 or even 1 often makes more sense.

## Detailed Design

Introducing a new prop say `interval` which controls how the field is incremented/decremented across all mediums (buttons, arrow keys, mouse wheel etc.) would allow the value to be optionally specified separately from `step`. This prop should only influence incrementing and decrementing it should not round/clamp the value to the same number of decimal places as `step` does, but `step` should retain this behaviour.

## Documentation

Since the proposed `interval` prop does not change existing behaviour, a simple addition to the documentation should suffice.

## Drawbacks

- Explaining the difference between `step` and `interval` may be tricky.
- This strays from built-in behaviour of number inputs which only provide the `step` option.

## Backwards Compatibility Analysis

No change.

## Alternatives

The only feasible alternative would be to rewrite the `<NumberField>` logic from scratch, or use a different library.

## Open Questions

Does having 2 options similarly named `step` and `interval` make sense or should it be `step` or `clamp` and `interval`?

## Help Needed

If we are happy with the approach, I am happy to give an implementation a go.

## Frequently Asked Questions

<!--
    This section is optional but suggested.

    Try to anticipate points of clarification that might be needed by
    the people reviewing this RFC. Include those questions and answers
    in this section.
-->

## Related Discussions

- https://github.com/adobe/react-spectrum/issues/7288
- https://github.com/adobe/react-spectrum/issues/6359
- https://github.com/adobe/react-spectrum/issues/7867
