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

We will also catch errors that are thrown by actions and expose them as an `actionError` render prop, or via the `FieldError` component, enabling [in-line contextual error UIs](https://x.com/devongovett/status/1989788456751697958). This will help reduce over-reliance on toasts as a catch-all way of handling errors in applications by making inline errors just as easy to implement.

All together, this significantly simplifies the implementation of loading states and error handling for component libraries and applications. Simply render a `<ProgressBar>` when `isPending` is true, add an async function as an action prop, and React Aria handles the rest.

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
* Form – `submitAction` (add a `FormError` component to display form-level errors)
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

### Examples

#### Pending button

A save button that displays a spinner while an action is running (e.g. calling a server). Pending buttons are not interactive (but remain focusable).

```tsx
function App() {
  return (
    <Button
      action={async () => {
        await save();
      }}>
      {({isPending}) => (
        <>
          {isPending 
            ? <ProgressBar aria-label="Saving" isIndeterminate />
            : 'Save'}
        </>
      )}
    </Button>
  );
}
```

#### Async search results

A search field for a filterable list. Typing in the field causes a state update, and the results list suspends. While the results are loading, the search field displays a spinner and the previous results display in the list and remain interactive.

This illustrates that the pending state may display for longer than the action itself if another part of the UI suspends as a result. The `Suspense` wrapping the result list only displays its fallback during the initial load sequence, not when the update is triggered by an action (this is React's default behavior for transitions).

```tsx
function App() {
  let [search, setSearch] = useState('');

  return (
    <>
      <SearchField
        value={search}
        changeAction={value => setSearch(value)}>
        {({isPending}) => (
          <>
            <Label>Search</Label>
            <Input />
            {isPending && <ProgressBar aria-label="Saving" isIndeterminate />}
          </>
        )}
      </SearchField>
      <React.Suspense fallback="Initial loading state">
        <ResultList search={search} />
      </React.Suspense>
    </>
  );
}
```

#### Error handling

If an error occurs in an action, it is available via the `actionError` render prop. This button has a shake animation when an error occurs, and displays an error icon.

```tsx
function App() {
  return (
    <Button
      action={async () => {
        await save();
      }}
      style={({actionError}) => ({
        animation: actionError ? `shake 1s` : undefined
      })}>
      {({isPending, actionError}) => (
        <>
          {actionError && <ErrorIcon aria-label="Error" />}
          {isPending 
            ? <ProgressBar aria-label="Saving" isIndeterminate />
            : 'Save'}
        </>
      )}
    </Button>
  );
}
```

If you didn't want the Button itself to handle errors and wanted to show errors in a different way, you could add a try/catch statement within the action and catch the error there.

```diff
action={async () => {
+ try {
    await save();
+ } catch (err) {
+   showToast(err);
+ }
}}
```

In field components, we could also use the existing `FieldError` to show action errors. In this example, if saving a setting failed, the error would be displayed below the checkbox.

```tsx
function App() {
  return (
    <CheckboxField
      changeAction={async (isSelected) => {
        try {
          await saveSetting(isSelected);
        } catch {
          throw 'Failed to save setting.';
        }
      }}>
      <CheckboxButton>Setting</CheckboxButton>
      <FieldError />
    </CheckboxField>
  );
}
```

**Note**: Errors are only caught when they occur within the action itself, not if another component suspends as a result. This makes sense from a UI perspective: if an error occurred while loading something, it should display where the results would have been (via an error boundary). If it occurred while saving something, it should display where the action was initiated.

#### In a design system

In a design system such as Spectrum, the loading and error states in the above examples would be built-in. This means application code does not need to worry these states at all.

```tsx
import {Button, Checkbox} from '@react-spectrum/s2';

function App() {
  return (
    <>
      <Button action={async () => await doIt()}>
        Do something
      </Button>
      <Checkbox
        changeAction={async (isSelected) => {
          try {
            await saveSetting(isSelected);
          } catch {
            throw 'Failed to save setting.';
          }
        }}>
        Setting
      </Checkbox>
    </>
  );
}
```

#### Form errors

When an error is thrown in a form's `submitAction`, it will be available via the `actionError` render prop. This can be displayed to the user by rendering an `<Alert>`, which will be focused and announced by screen readers. For field-level errors (e.g. server validation), a special error object compatible with [Standard Schema](https://standardschema.dev/schema) could be supported, allowing these errors to be automatically propagated to the correct fields (as we support via the `validationErrors` prop today).

**Note**: This proposes a separate `submitAction` prop rather than overloading the existing `action` prop supported by React. `submitAction` has a few differences from `action`:

* Errors thrown during the action are caught and passed to the `actionError` render prop.
* The pending state is automatically passed to the form's submit button. Alternatively we could use React's [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus) hook for that, but this has [bugs](https://github.com/facebook/react/issues/30368) at the moment.
* The form is not automatically reset after the action completes. This is a [controversial](https://github.com/facebook/react/issues/29034) behavior that is often unwanted (e.g. when errors occur). If a reset is desired, it can be triggered manually via `ReactDOM.requestFormReset`.

```tsx
function App() {
  return (
    <Form
      submitAction={async (formData) => {
        let email = formData.get('email');
        if (!await isAccountAvailable(email)) {
          throw {
            issues: [{
              message: 'An account with that email already exists',
              path: ['email']
            }]
          }
        }

        try {
          await createAccount(email);
        } catch {
          throw 'Could not create account';
        }
      }}>
      {({actionError}) => (
        <>
          {actionError &&
            <Alert>{String(actionError)}</Alert>
          }
          <TextField name="email" />
          <Button type="submit">Submit</Button>
        </>
      )}
    </Form>
  );
}
```

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
