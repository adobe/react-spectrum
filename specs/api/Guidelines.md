<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

# API Design Guidelines

## Boolean Props
- Name boolean props starting with `is` when they represent a state of the component. For example, `isDisabled`, `isRequired`.
- Name boolean props starting with `allows` when they represent a restriction on what a user can do. For example, `allowsSelection`, `allowsDuplicates`.
- Name boolean props that show or hide an option starting with `show` or `hide` depending on the default value.
- Name boolean props starting with `should` when they control the behavior of the component. For example, `shouldFlip`, `shouldCache`.
- The default value for most boolean props should be `false`. Users shouldn’t typically be turning off options, but turning them on.
- Never start a boolean prop with `render`, e.g. `renderIcon`. This can be confused with a render prop function, which would be what actually renders that item. Name with the `show` prefix instead, e.g. `showIcon`.
- Don’t use booleans for props that may reasonably support more than two items, even if that is not supported now. For example, `validationState=``"``invalid``"` instead of `isInvalid` so that `validationState=``"``valid``"` could be supported in the future.
## Event Callback Props
- Name event callbacks starting with `on`, e.g. `onSelect`.
- If a value needs to be passed to the callback, pass it as the first argument.
- If an event object is available, pass it as the last argument.
- Use platform agnostic event naming where possible. E.g. `onPress` instead of `onClick` to support mobile/touch devices instead of only mouse events.
- If the event is a change event for a prop that is passed in, name the event ending with `Change`, e.g. `onSelectionChange`.
- `onChange` should only be used to correspond with the `value` prop. For other change events, include a relevant word between `on` and `Change`, e.g. `onSelectionChange`.
- Use present tense for event names, e.g. `onChange` not `onChanged`.
## Children vs Props
- Use `children` rather than string props for the main content of a component. This allows more flexibility for the user to put whatever custom formatting they need to on the content (e.g. JSX) rather than being forced to only support plain text.
- Use `children` where possible for lists of content, e.g. `MenuItem` children rather than an array of options. This lets users customize both the content of an item along with the item itself.
- Name child components starting with the main component name, e.g. a `Menu` contains `MenuItem` children.
- For components that accept multiple pieces of content where children would be ambiguous, take the main content as children and the others as props. For example, `title` in `AccordionItem` in addition to `children`.
## Render Props
- Use render props when some rendering needs to be delegated to the user.
- Name render props starting with `render`, e.g. `renderItem` or `renderDragView`.
- Pass the item to render as an argument.
- Generally, children should be used instead where possible, but there are cases where this doesn’t work. For example, virtualized lists should have a `renderItem` prop.
## Controlled and Uncontrolled Components
- Support both controlled values for props that can be changed by the user.
- Name uncontrolled values starting with `default`, and ending with the same name as the controlled prop. For example, if there is a `value` controlled prop, the uncontrolled version would be `defaultValue`.
## Direction Agnostic Naming
- For RTL support, never use `left` or `right` as alignment or positioning names. Instead use `start` or `end`, which could be left or right depending on the writing direction. This allows the UI to automatically flip in RTL mode. The only exception is when it makes sense to allow a user to specific left or right specifically, rather than being based on the writing direction.
Index Based Props vs Value Based Props
- Avoid index based props where possible, e.g. `selectedIndex`. Prefer value based props, e.g. `selectedItem`. Indices can become invalid as items are added or removed whereas values stay consistent.
- If referring to a child element by value, support a `value` prop on the child element. For example, `MenuItem` has a `value` prop to allow `Select` and `ComboBox` to refer to it.
## Splitting Components
- Split components into separate components when their options no longer make sense together. For example the options for `Button` and `ActionButton` are different, so they should be separate components.
- Split components when the types of their props change. For example, `Slider` and `RangeSlider` accept different `value` props, one is a single value the other is a range.
## Prop Restrictions
- Props that restrict other props should be named with the name of the main prop at the end. For example, `minValue` restricts `value`. If it were only called `min` it would be ambiguous.
## DOM Props
- All valid DOM props should always be passed through to the root HTML element of a component.
- DOM props should be combined with the computed default DOM props for a component. For example, a `className` prop should be combined with the default Spectrum CSS class names.
- Events should be chained with the default implementations. For example, a user’s `onKeyDown` prop should be run in addition to the key down handler internal to the component.
## Child Element Customization
- Sometimes components compose multiple child elements together. For example, a `SplitButton` composes two buttons and a `Menu`. In order to allow customizing those child elements, e.g. for custom CSS classes, testing props, or other DOM props, a `childElementProps` prop should be supported.
- `childElementProps` should be a map of child element names to an object of DOM props. For example, `childElementProps.trigger` for the menu trigger button in a `SplitButton`.
- Only valid DOM props for these elements should be supported, not other props that might override the behavior of the component.
## Common Prop Names
- Reuse common prop names across components where it makes sense. Some common ones are below.
- Reuse shared APIs where it makes sense. See [Shared APIs](http://github.com)*

```javascript
variant = 'a' | 'b' // options dependent on component
isQuiet, isEmphasized
density = 'compact' | 'regular' | 'spacious'
orientation = 'horizontal' | 'vertical'
size = 'XS' | 'S' | 'M' | 'L' | 'XL'
align = 'start' | 'end'
labelPosition = 'top' | 'side'
isIndeterminate
```
