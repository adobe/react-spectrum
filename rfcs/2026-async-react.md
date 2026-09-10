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

At React Conf 2025, the React core team [presented](https://www.youtube.com/watch?v=B_2E96URooA) their vision of "Async React". Using features introduced in React 19 such as [useTransition](https://react.dev/reference/react/useTransition), [useOptimistic](https://react.dev/reference/react/useOptimistic), and [Suspense](https://react.dev/reference/react/Suspense) for data fetching, React can now coordinate pending states across an entire app, and reduce the amount of code needed to handle data fetching edge cases. This improves the user experience by making loading/saving states in-line with the component that triggered the update.

While these React features are usable today, they require some boilerplate to set up. This can be simplified by introducing the [action prop](https://react.dev/reference/react/useTransition#exposing-action-props-from-components) pattern. By convention, action props are automatically wrapped in React's `startTransition` function and may include a pending state within the component that triggered them. This way the application doesn't need to handle these states themselves since it's handled by the component library.

## Detailed Design

This RFC proposes two new features: built-in action props, and improved support for data fetching with Suspense. While it's possible to introduce these at a higher level (e.g. in a design system), pending and error states have accessibility requirements to ensure clear announcements for screen readers, focus management, etc. In addition, multiple design systems can benefit from handling pending states at a lower level layer.

### Action props

Action props will correspond to events, either using the `action` name for simple actions (e.g. Button) or the `Action` suffix (e.g. `changeAction`). These accept an `async` function, which is called within React's `startTransition` function. Each component supporting actions will expose an `isPending` render prop and `data-pending` DOM attribute. This will be used to render a `<ProgressBar>`, associated with the element via ARIA attributes. We will also handle announcing the state change via an ARIA live region.

Components with state will use `useOptimistic` to update immediately in response to user input. This state is automatically updated to the latest value by React when the action completes. Optimistic updates seem to be the desired behavior in most cases, but if you want to opt-out, you can continue to use events such as `onChange` instead of actions, and implement your own transition external to the component.

To implement this, we can create a new hook that wraps `useControlledState` and also supports action props. When the value setter is called, we start a transition, set the optimistic value, and trigger the change action. We will also continue emit the `onChange` event and support both controlled and uncontrolled state.

We will also catch errors that are thrown by actions and expose them as an `actionError` render prop, or via the `FieldError` component, enabling [in-line contextual error UIs](https://x.com/devongovett/status/1989788456751697958). This will help reduce over-reliance on toasts as a catch-all way of handling errors in applications by making inline errors just as easy to implement.

All together, this significantly simplifies the implementation of pending states and error handling for component libraries and applications. Simply render a `<ProgressBar>` when `isPending` is true, add an async function as an action prop, and React Aria handles the rest.

Here's a potential list of components that could support actions:

* Button - `action`
* Checkbox - `changeAction` (only when using `CheckboxField`, introduced in [#9877](https://github.com/adobe/react-spectrum/pull/9877))
* CheckboxGroup - `changeAction`
* Calendar - `changeAction`
* ColorSwatchPicker - `changeAction`
* ColorSlider - `changeEndAction`
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
* Slider - `changeEndAction`
* Switch - `changeAction` (only when using `SwitchField`, introduced in [#9877](https://github.com/adobe/react-spectrum/pull/9877))
* Table – `sortAction` (progress should show within the sorted column header), `expandAction`, `selectionAction`?
* Tabs - `selectionAction`
* TagGroup - `removeAction`?
* TextField - `changeAction`
* TimeField - `changeAction`
* ToggleButton - `changeAction`
* Tree - `expandAction`

Below are some examples of some common patterns.

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

Note that React Server Functions do not support throwing errors. In production, React redacts the error message to avoid potentially exposing internal server implementation details like the stack. To work around this, it's recommended to return errors as values instead of throwing, and then re-throw on the client.

```tsx
action={async () => {
  let {error} = await save();
  if (error) {
    throw error;
  }
}}
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

**Note**: This proposes a separate `submitAction` prop rather than overloading the existing `action` prop supported by React. `submitAction` has a few differences from `action`:

* Errors thrown during the action are caught and passed to the `actionError` render prop.
* The pending state is automatically passed to the form's submit button. Alternatively we could use React's [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus) hook for that, but this has [bugs](https://github.com/facebook/react/issues/30368) at the moment.
* The form is not automatically reset after the action completes. This is a [controversial](https://github.com/facebook/react/issues/29034) behavior that is often unwanted (e.g. when errors occur). If a reset is desired, it can be triggered manually via `ReactDOM.requestFormReset`.

### Suspense

Today, we support initial loading states in our collection components through `renderEmptyState` with externally controlled state management. Infinite loading is done via collection-specific components, e.g. `ListBoxLoadMoreItem` which trigger their `onLoadMore` callback when scrolled into view. State management is entirely left to external data fetching libraries (e.g. our `useAsyncList` hook, TanStack Query, SWR, etc).

With Suspense, we can simplify this by building loading states into our collection components. There are several benefits to using Suspense for data fetching instead of an external hook:

* It is declarative. External loading and error states must be manually passed around and rendered. Suspense allows design systems and component libraries to build in these states automatically, no matter the data source.
* It is composable. Different sections within a collection, or even multiple independent components of a page, can load from different data sources. Apps can decide whether to make those have a single loading state or separate ones.
* It will wait for nested parts of the UI to become ready. For example, if each list item contained an image, the list could wait to display the images together instead of popping in one by one.
* It supports streaming data from the server with React Server Components, enabling fetching to start earlier.

#### Collection additions

Suspense unlocks higher-level convenience APIs for loading paginated collections. For example, collection components can be extended to accept async generators, which have some nice properties:

1. They are lazy, which means they are always side effect free. This means they are safe to call during render (even in strict mode), because they don't actually start doing anything until you call `next()`.
2. They are memoizable. If we memoize the result of each `next()` they can be re-rendered safely. The generators themselves can be memoized with `useMemo` or automatically by React Compiler and invalidated when parameters change, or globally cached and shared between components.
3. They trivially support lazily loading additional pages of data on demand. Higher-level API wrappers can be created with regular function composition.

Here's an example of lazy loading a paginated API.

```tsx
async function *loadData(url) {
  while (url) {
    let json = await fetch(url).then(res => res.json());
    yield json.results;
    url = json.next;
  }
}

<ListBox
  items={loadData('https://pokeapi.co/api/v2/pokemon')}
  fallback={<ProgressCircle size="L" />}
  renderError={error => `Error loading data: ${error}`}
  loadMoreFallback={<ProgressCircle size="S" />}
  renderLoadMoreError={error => `Error loading more: ${error}`}>
  {item => <ListBoxItem>{item.name}</ListBoxItem>}
</ListBox>
```

ListBox includes built-in Suspense and error boundaries wrapping the collection to render the initial loading and error states, as well as a load more sentinel that triggers loading additional pages (by default at the end, but could be configured via a prop if needed).

Internally, collection components already render a `<Collection>`, which is where these new props would be implemented. This enables rendering multiple groups of items from separate data sources. By default, if `fallback` is provided, `Collection` includes its own loading state. If you had two sections in a ListBox that came from separate data sources, they would have separate loading states and be revealed independently.

```tsx
<ListBox>
  <Collection items={loadUsers()} fallback={...}>
    {item => <ListBoxItem>{item.name}</ListBoxItem>}
  </Collection>
  <Collection items={loadTeams()} fallback={...}>
    {item => <ListBoxItem>{item.name}</ListBoxItem>}
  </Collection>
</ListBox>
```

#### LoadingBoundary

If you instead wanted to reveal both groups together, you could omit `fallback` and wrap both in a `LoadingBoundary` (name TBD). This works like `React.Suspense` but with a few additions:

* It includes an error boundary when `renderError` is provided.
* When used in a collection, it wraps its fallback/error in an appropriate element to ensure the accessibility tree is valid (e.g. `<div role="option">`). This wrapper is provided via context.
* It supports `loading="lazy"`, which renders its children only once it is near the viewport.

```tsx
<ListBox>
  <LoadingBoundary fallback={<ProgressCircle />} renderError={...}>
    <Collection items={loadUsers()}>
      {item => <ListBoxItem>{item.name}</ListBoxItem>}
    </Collection>
    <Collection items={loadTeams()}>
      {item => <ListBoxItem>{item.name}</ListBoxItem>}
    </Collection>
  </LoadingBoundary>
</ListBox>
```

`LoadingBoundary` is also the lower level primitive that `Collection` is built on internally. It works by recursively rendering lazy loading suspense boundaries. For certain use cases where using async generators is not possible, you can also use this pattern directly.

```tsx
function Example() {
  return (
    <ListBox>
      <LoadingBoundary
        // Initial loading state
        fallback={<ProgressCircle />}
        renderError={error => `Error loading data: ${error}`}>
        <Page url="https://pokeapi.co/api/v2/pokemon" />
      </LoadingBoundary>
    </ListBox>
  );
}

function Page({url}) {
  // Use a Suspense-compatible data fetching library to get a cached promise for the url.
  let promise = fetchCached(url);
  let {results, next} = React.use(promise);

  // After the data loads, render the items.
  return (
    <>
      <Collection items={results}>
        {item => <ListBoxItem>{item.name}</ListBoxItem>}
      </Collection>
      {next && (
        // Lazily render the next page recursively.
        <LoadingBoundary
          loading="lazy"
          fallback={<ProgressCircle />}
          renderError={error => `Error loading data: ${error}`}>
          <Page url={next} />
        </LoadingBoundary>
      )}
    </>
  );
}
```

In a design system like Spectrum, fallbacks and error state rendering would be provided by default so consumers don't need to implement them. We could provide a prop such as `revealWith="parent"` to opt-out of the default Suspense boundary, and reveal with the parent boundary instead.

This API progressively discloses complexity depending on the use case:

* In a majority of cases with a single data source, pass an async generator to the top-level `items` prop.
* To combine multiple data sources, render each with `Collection`. These reveal independently.
* To reveal multiple data sources together, wrap them with a `LoadingBoundary`.
* To work with data sources or libraries that don't use async generators, use the recursive `LoadingBoundary` pattern described above.
* To work with data sources that don't use Suspense at all, continue using existing synchronous `items` and external state management.

## Documentation

We'll add new examples to our documentation showing how to use action props, and add pending states to components in our starter kits. The Collections page should be updated to describe the above data loading patterns, as well as usage with external data fetching libraries.

## Drawbacks

It adds additional things for people to learn, but since this is the direction the React team is heading it seems worth it.

## Backwards Compatibility Analysis

Action props will only be supported in React 19 and later. When using an older version of React, we will throw an error.

## Open Questions

* Do pending states make sense in all of these components? Supporting these within Spectrum will require input from design.
* How do we want to support pending states that aren't displayed as a progress bar / spinner (e.g. a "shimmer")? We may need to announce something, even if a progress bar is not present in the DOM.
* How do we want to handle components that have both a loading state for data and a pending state for an action? For example, Select and ComboBox support loading states for their list of items, but may also support a changeAction when the user selects an item. Would these both display the same spinner UI?
* For components with multiple actions, do we want individual pending states (e.g. `isChangePending`, `isSubmitPending`) or a single pending state that aggregates these?
* How to handle re-trying if an error occurs during data loading. If a generator throws, it cannot be resumed by default. One way to avoid this is to yield special error objects instead of throwing. Then retrying is just calling `next()` again.

  ```tsx
  async function *loadData(url) {
    while (url) {
      try {
        let json = await fetch(url).then(res => res.json());
        yield json.results;
        url = json.next;
      } catch (error) {
        yield {error};
      }
    }
  }
  ```

  However another question is how to enable re-trying in the UI, especially for components like ListBox that don't allow interactive children within items. We don't really support re-trying in existing collection components today either.
* Usage with React Server Components. Async iterators can be streamed to the client, but they are eager instead of lazy (meaning all of the pages would be loaded up front). Perhaps a pattern can be developed where the first page gets streamed to the client, and additional pages are loaded via Server Actions.
