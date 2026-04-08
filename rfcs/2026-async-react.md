<!-- Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2026-04-08
- RFC PR: (leave this empty, to be filled in later)
- Authors: Devon Govett

# Adopting Async React in React Aria Components

## Summary

In this RFC, we propose adding support for React's action prop pattern to React Aria Components, along with built-in support for pending states across many components.

## Motivation

At React Conf 2025, the React core team [presented](https://www.youtube.com/watch?v=B_2E96URooA) their vision of "Async React". Using features introduced in React 19 such as [useTransition](https://react.dev/reference/react/useTransition), [useOptimistic](https://react.dev/reference/react/useOptimistic), and [Suspense](https://react.dev/reference/react/Suspense) for data fetching, React can now coordinate loading states across an entire app, and reduce the amount of code needed to handle data loading edge cases. This improves the user experience by making loading/saving states in-line with the component that triggered the update.

While these React hooks are usable today, they require some boilerplate to set up. This can be simplified by introducing the [action prop](https://react.dev/reference/react/useTransition#exposing-action-props-from-components) pattern. By convention, action props are automatically wrapped in React's `startTransition` function and may include a pending state within the component that triggered them. This way the application doesn't need to handle these states themselves since it's handled by the component library.

## Detailed Design

This RFC proposes adding support for action props directly to React Aria Components. While it's possible to introduce these at a higher level (e.g. in a design system), pending states have accessibility requirements to ensure clear announcements for screen readers, focus management, etc. In addition, multiple design systems can benefit from handling pending states at a lower level layer.

Action props will correspond to events, either using the `action` name for simple actions (e.g. Button) or the `Action` suffix (e.g. `changeAction`). These accept an `async` function, which is called within React's `startTransition` function. Each component supporting actions will expose an `isPending` render prop and `data-pending` DOM attribute. This will be used to render a `<ProgressBar>`, associated with the element via ARIA attributes. We will also handle announcing the state change via an ARIA live region.

Components with state will use `useOptimistic` to update immediately in response to user input. This state is automatically updated to the latest value by React when the action completes. Optimistic updates seem to be the desired behavior in most cases, but if you want to opt-out, you can continue to use events such as `onChange` instead of actions, and implement your own transition external to the component.

To implement this, we can create a new hook that wraps `useControlledState` and also supports action props. When the value setter is called, we start a transition, set the optimistic value, and trigger the change action. We will also continue emit the `onChange` event and support both controlled and uncontrolled state.

We could also potentially catch errors that are thrown by actions and expose these as render props, enabling [in-line contextual error UIs](https://x.com/devongovett/status/1989788456751697958).

All together, this significantly simplifies the implementation of loading states for component libraries and applications. Simply render a `<ProgressBar>` when `isPending` is true, add an async function as an action prop, and React Aria handles the rest.

Here's a potential list of components that could support actions:

* Button - `action`
* Checkbox - `changeAction` (only when using `CheckboxField`, introduced in [#9877](https://github.com/adobe/react-spectrum/pull/9877))
* CheckboxGroup - `changeAction`
* Calendar - `changeAction`
* ColorSwatchPicker - `changeAction`
* ColorSlider - `changeAction`
* ComboBox - `changeAction`
* DateField - `changeAction`
* DatePicker - `changeAction`
* DateRangePicker - `changeAction`
* Disclosure - `expandAction`
* NumberField - `changeAction`
* RadioGroup - `changeAction`
* SearchField - `changeAction`, `submitAction`, `clearAction`
* Select - `changeAction`
* Slider - `changeAction`
* Switch - `changeAction` (only when using `SwitchField`, introduced in [#9877](https://github.com/adobe/react-spectrum/pull/9877))
* Tabs - `selectionAction`
* TextField - `changeAction`
* TimeField - `changeAction`
* ToggleButton - `changeAction`

## Documentation

We'll add new examples to our documentation showing how to use action props, and add pending states to components in our starter kits.

## Drawbacks

It adds additional things for people to learn, but since this is the direction the React team is heading it seems worth it.

## Backwards Compatibility Analysis

Action props will only be supported in React 19 and later. When using an older version of React, we will throw an error.

## Open Questions

* Do pending states make sense in all of these components? Supporting these within Spectrum will require input from design.
* How do we want to support pending states that aren't displayed as a progress bar / spinner (e.g. a "shimmer")? We may need to announce something, even if a progress bar is not present in the DOM.
* How do we want to handle components that have both a loading state for data and a pending state for an action? For example, Select and ComboBox support loading states for their list of items, but may also support a changeAction when the user selects an item. Would these both display the same spinner UI?
* For components with multiple actions, do we want individual pending states (e.g. `isChangePending`, `isSubmitPending`) or a single pending state that aggregates these?
