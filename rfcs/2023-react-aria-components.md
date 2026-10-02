<!-- Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2023-02-13
- RFC PR: https://github.com/adobe/react-spectrum/pull/4171
- Authors: Devon Govett

# React Aria Components

## Summary

This RFC proposes adding a new component-based API for React Aria built on top of the existing hooks. It will provide an easier way to build accessible components with custom styles for many use cases, while still offering the flexibility to drop down to the lower level hook-based API for even more customizability where needed.

## Motivation

Since releasing it in 2020, React Aria has been adopted by many companies building their own design systems. Internally within Adobe, there have also been many uses of it by products building custom components that are not available in React Spectrum. React Aria is a low level API that was designed to enable fully customizing the DOM structure, events, state management, etc. This flexibility has made it possible to reuse the accessibility and interactions work we have done while fully customizing the design and behavior in your own components.

However, while developers appreciate the flexibility that React Aria offers, we have also received feedback that it has a very steep learning curve, and that the APIs are complex and hard to put together for simple use cases. If you're building a one-off component for an app rather than a whole design system, or have simple styling requirements rather than needing to fully customize the behavior, it can be more difficult than necessary. This leads developers to choose alternative libraries, build things from scratch themselves, or try to override the styles of existing design system components (e.g. in React Spectrum). These options might be brittle or less accessible than components built with React Aria.

We have been improving our existing hook-based APIs to make them easier to use, but we can only take this so far. Some things still inherently require a good amount of glue code to get working, such as setting up context to send state between components, wiring refs and props to the right elements, ensuring the DOM structure is correct, etc. Building a complete pattern may require implementing several different components, documented across multiple pages. This can be overwhelming if you're getting started with React Aria for the first time.

We think there is room for a higher level component-based API that sits on top of the existing React Aria hooks and handles all of this glue for you so you can focus on your custom styling. This improved developer experience for common cases will come at the expense of some flexibility in edge cases, which can be mitigated by dropping down to the hook-based API for additional customization only where needed. Making the APIs easier to use could help increase adoption of React Aria both externally and internally within Adobe, leading to improved accessibility and avoiding brittle style overrides of React Spectrum components in products.

## Detailed Design

At a high level, React Aria Components is a library of unstyled components implementing ARIA patterns. It is implemented as a thin layer on top of our existing React Aria hooks. The components provide a default DOM structure and styling API, and abstract away the glue code necessary to connect the hooks together. The hooks will also continue to be maintained and documented as a first-class API in addition to the new component API.

The components and hooks also work together, allowing them to be mixed and matched depending on the level of customization required. We would recommend that developers start with the component API by default, and only drop down to hooks when they need additional customization options. This strategy offers the best of both worlds, where simple things are easy, and complex things are possible.

### API Fundamentals

The React Aria Components API is designed around composition. Each component generally has a 1:1 relationship with a single DOM element, which makes it easy to style every element and control the layout and DOM order of the children.

In addition, many components are reused between patterns. For example, `<ListBox>` is used in `<ComboBox>`, `<Select>`, and other components. This is in contrast to some component libraries that have `<ComboBoxListBox>` and `<SelectListBox>` components which must be implemented separately and potentially duplicate a lot of styling code.

```jsx
import {Button, ComboBox, Input, Item, Label, ListBox, Popover} from 'react-aria-components';

<ComboBox>
  <Label>Favorite Animal</Label>
  <div>
    <Input />
    <Button>▼</Button>
  </div>
  <Popover>
    <ListBox>
      <Item>Cat</Item>
      <Item>Dog</Item>
      <Item>Kangaroo</Item>
    </ListBox>
  </Popover>
</ComboBox>
```

Each component also exposes a context object, e.g. `ListBoxContext`, which allows a parent component to send it props. This is what enables the above composition: internally, `ComboBox` calls the `useComboBox` hook and passes the resulting `listBoxProps` to the nested `ListBox` component via this context.

In some cases, there may be multiple different instances of the same component within a pattern. For example, a NumberField has two buttons: one to increment, and one to decrement. In this case, the `slot` prop is used to distinguish them, similar to [slots in React Spectrum](2019-v3-slots.md).

```jsx
<NumberField>
  <Label>Width</Label>
  <Group>
    <Button slot="decrement">-</Button>
    <Input />
    <Button slot="increment">+</Button>
  </Group>
</NumberField>
```

### Styling

By default, React Aria Components have no styles. They can be styled in many ways, including using CSS classes, inline styles, utility classes (e.g. Tailwind), CSS-in-JS (e.g. Styled Components), etc. All components include a built-in default `className` which can be targeted using CSS selectors to apply styles. These follow the `.react-aria-ComponentName` naming convention.

```css
.react-aria-Select {
  /* ... */
}
```

This makes it easy to style React Aria Components without needing to come up with your own class names or write any styling code at all in your JSX. It is similar to how you might style a native DOM element like a `<select>`, just with a class selector instead of an element selector. Standardizing these class names also makes it easy to create pre-built themes for React Aria Components that can be reused between projects.

That said, if multiple separate implementations of the same component are on a page at once, styles could conflict. Therefore, a custom `className` can also be specified on any component. This overrides the default `className` provided by React Aria with your own. This would be useful when using styling methods like CSS modules, or utility CSS libraries like [Tailwind](https://tailwindcss.com/).

```jsx
<Select className="my-select">
  {/* ... */}
</Select>
```

If you want to apply both React Aria's default class name in addition to a custom one, you can apply them manually, e.g. `className="react-aria-Select my-select"`.

#### States

Some components support multiple UI states (e.g. pressed, hovered, selected, etc.). React Aria components expose states using DOM attributes, which can be targeted by CSS selectors. These are ARIA attributes wherever possible, or data attributes when a relevant ARIA attribute does not exist. They can be thought of like custom CSS pseudo classes. For example:

```css
.react-aria-Item[aria-selected=true] {
  /* ... */
}

.react-aria-Item[data-focused] {
  /* ... */
}
```

Using attributes for states has the advantage that mutually exclusive values other than booleans are also supported. For example, the placement of a popover relative to its trigger can be defined as a data attribute:

```css
.react-aria-Popover[data-placement=left] {
  /* ... */
}
```

The `className` and `style` props also accept functions which receive states for styling. This lets you dynamically determine the classes or styles to apply, which is useful when using utility CSS libraries like [Tailwind](https://tailwindcss.com/).

```jsx
<Item className={({isSelected}) => isSelected ? 'bg-blue-400' : 'bg-gray-100'}>
  Item
</Item>
```

Render props may also be used as children to alter what elements are rendered based on the current state. For example, you could render a checkmark icon when an item is selected.

```jsx
<Item>
  {({isSelected}) => (
    <>
      {isSelected && <CheckmarkIcon />}
      Item
    </>
  )}
</Item>
```

This styling API is inspired by [Headless UI](https://headlessui.com), [Radix UI](https://www.radix-ui.com), and [Reach UI](https://reach.tech). Thanks!

### Collections

React Stately's [Collection](https://react-spectrum.adobe.com/react-stately/collections.html) and [Selection](https://react-spectrum.adobe.com/react-stately/selection.html) APIs have mostly proved to be a success, and will not change much in React Aria Components. The main limitation has been about composition: in our current implementation, `<Item>` must be a direct child of the collection component and cannot be within a wrapper component like `<MySpecialItem>`. This is a minor frustration for developers who expect these components to work like any other React component. This will become more important in React Aria Components where creating a wrapper with reusable styles will be common.

Rather than walking the JSX tree to collect items, the new implementation will rely on React itself to build and efficiently update collections. It works by implementing a tiny version of the DOM with just the methods React needs (e.g. `createElement`, `appendChild`, etc.). Then, it uses a React portal to render the collection into this fake DOM. React takes care of rendering all intermediary wrapper components, and leaf components like `<Item>` are rendered as "host" elements (similar to real DOM nodes). This gives us access to the underlying items as if they were rendered directly to the DOM, but without needing to pay this cost for large collections. We use this information to construct a `Collection` using the same interface as in the old implementation so all of our existing hooks work with it.

This implementation enables wrapper components to be used as expected:

```jsx
function MyItem(props) {
  return (
    <Item
      {...props}
      className="my-item" />
  );
}
```

Note that props passed to `<MyItem>` must be manually passed through to the underlying `<Item>` for it to work properly. In addition, this implementation has two downsides:

1. It requires two renders whenever something in the collection changes. The first causes the portal to be rendered, which updates the fake DOM. It then needs to kick off a second render pass to render the items into the real DOM. However, because the first pass is rendering into a fake DOM, it is quite fast and in testing so far hasn't been a problem.
2. Our current implementation heavily uses the React `key` prop to identify items in collections. However, this will not work with the new implementation because `key` is not passed through from the `<Item>` element to the implementation of the `Item` component. Therefore, we will need to use a different prop name such as `id` that is passed through. This would be a breaking change to switch to by default, but for React Aria Components this is ok since it is a new library. We will need to think through how to release this in our existing React Aria hooks and React Spectrum components separately.

These downsides seem to be out-weighed by the benefits of allowing custom wrappers, both by users and internally where it makes sense (e.g. `<Tab>` instead of `<Item>`).

### Advanced customization

As described above, each component exposes a corresponding context which can be used to send props to it when used in a larger pattern. Because these contexts are exported, this also means you can write your own version of a component such as `ListBox` that works within a `ComboBox`, `Select`, etc. This enables using the hook-based API for additional customization options when needed, such as changing the DOM structure, accessing internal state, overriding event handlers, etc. Rather than rewriting the whole `ComboBox` pattern when you need to do that, you can just swap out the `ListBox`.

```jsx
import {ListBoxContext, useContextProps} from 'react-aria-components';
import {useListBox} from 'react-aria';

function MyListBox(props) {
  // Merge local props and ref with props from context.
  let ref = React.useRef();
  [props, ref] = useContextProps(props, ref, ListBoxContext);

  // Get state sent from ComboBox via context, and call useListBox.
  let {state} = React.useContext(ListBoxContext);
  let {listBoxProps} = useListBox(props, state, ref);

  // Render stuff
  return (
    <div {...listBoxProps}>
      {/* ... */}
    </div>
  );
}
```

Now you can use your custom `MyListBox` component within a `ComboBox` or `Select` from `react-aria-components`, just like the default `ListBox`:

```jsx
import {Button, ComboBox, Input, Item, Label, Popover} from 'react-aria-components';
import {MyListBox} from './MyListBox';

<ComboBox>
  <Label>Favorite Animal</Label>
  <div>
    <Input />
    <Button>▼</Button>
  </div>
  <Popover>
    <MyListBox>
      <Item>Cat</Item>
      <Item>Dog</Item>
    </MyListBox>
  </Popover>
</ComboBox>
```

This also works the other way. If you need to customize `ComboBox` itself, but want to reuse the components it contains, you can do so by providing the necessary contexts.

```jsx
import {useComboBox} from 'react-aria';
import {ButtonContext, InputContext, LabelContext, ListBoxContext, Provider} from 'react-aria-components';

function MyComboBox(props) {
  // ...
  let {
    buttonProps,
    inputProps,
    listBoxProps,
    labelProps
  } = useComboBox({/* ... */});

  return (
    <Provider
      values={[
        [LabelContext, labelProps],
        [ButtonContext, buttonProps],
        [InputContext, inputProps],
        [ListBoxContext, listBoxProps]
      ]}
    >
      {props.children}
    </Provider>
  );
}
```

This enables you to reuse `ListBox`, `Popover`, and other elements from `react-aria-components` within your custom `MyComboBox` component:

```jsx
import {Button, Input, Item, Label, ListBox, Popover} from 'react-aria-components';
import {MyComboBox} from './MyComboBox';

<MyComboBox>
  <Label>Favorite Animal</Label>
  <div>
    <Input />
    <Button>▼</Button>
  </div>
  <Popover>
    <ListBox>
      <Item>Cat</Item>
      <Item>Dog</Item>
    </ListBox>
  </Popover>
</MyComboBox>
```

This ability to mix and match hooks with components provides the best of both worlds: start out with the component-based API, and if you hit a point where you need to customize beyond what the higher level API allows, drop down to hooks just for that one part without rewriting the rest.

### Future use in React Spectrum

Many of the simpler components in React Spectrum could be updated to build on top of React Aria Components rather than the hooks. Other more complex components with Spectrum-specific behaviors or custom DOM structures to support things like virtualized scrolling, etc. may be better suited to the hooks. For future components, we can decide what would make the most sense, and we could also consider updating existing components where it is advantageous.

Ideally, Spectrum CSS itself would use a selector structure that is compatible with React Aria components (e.g. using attributes for states). However, this is a much bigger project, and Spectrum CSS should be compatible with React Aria Components already with some minor styling code to apply the right classes.

## Documentation

This RFC proposes a significant new API addition which will require an update to the way our documentation is organized. Each component should include a documentation page, in addition to our existing hook docs. To reduce the number of pages shown in the website navigation at once, we could group the pages into collapsible sections:

* Components – documentation for the new component API, with sub-sections for each category as we have today (e.g. buttons, collections, date and time, etc.).
* Hooks – our existing hook documentation for ARIA patterns, without the hooks moved into the below sections.
* Patterns – hook documentation for lower level patterns that span multiple ARIA patterns, such as collections, selection, virtualizer, drag and drop, etc.
* Interactions – documentation for interactions like usePress, useHover, FocusScope, etc.
* Utilities – documentation for various utilities that don't fit into the other categories, like i18n, SSR, mergeProps, etc.

Each component page should have several sections, similar to the documentation for React Spectrum:

* A main example showing a minimal real-world scenario. The CSS for this should be collapsed underneath so it can be expanded only if needed.
* Features – a list of the main features of the component, grouped by category to allow easy skimming.
* Anatomy – the anatomy diagram and description of the various parts of the component. For components that compose other child components, links to the documentation for those components would be useful, along with any conceptual documentation (e.g. collections, selection).
* Prop table for all relevant components.
* Styling – a description of how to style the component in various ways, including documentation of all of the available states and CSS selectors. Links to styled codesandbox examples with various tools like we have in our hook docs might be useful as well.
* Reusable wrappers – an example of creating a reusable component with the styling implementation and all of the parts included.
* Usage – the usage section copied from the hook documentation.
* Advanced customization – if applicable, shows how to mix and match this component with the hooks and links to all of the relevant hook documentation for when more customization is needed.

This may seem like a lot, but most of this can either be copied from existing React Aria hook documentation, or reused from other pages (e.g. most of the styling guide).

Overall, the documentation should aim to show as many real-world examples as possible. The examples should also be styled to look somewhat pretty, rather than the bare-bones styles in our current React Aria docs. The example styles can leave a significant impression on readers even if styling isn't the point, so we want to make them look good to show what is possible. This includes things like supporting light and dark mode, windows high contrast mode, etc. People can also copy and paste the default styles as a starting point, so it is good to capture as many cases as possible.

Finally, we should update our home page and getting started guides to reflect the new APIs. We would recommend that developers start with the component API, and only drop down to the hooks when they need additional customization options. We will need to clearly explain why there are two APIs, and when to use each one. The home page will need to be updated, and links should point to the components rather than hooks by default.

## Drawbacks

This is a large new addition to our API that we will need to maintain and include in our releases going forward. However, it is a relatively simple layer on top of our existing hooks that we already maintain, which we may even use in React Spectrum, so this extra burden is minimal.

Another drawback is that it makes the documentation a bit more complex and potentially confusing for newcomers. Developers must now choose between two different APIs for the same thing. This can be mitigated by clearly recommending one solution over another for most use cases, and defining the cases where the other is a better fit. Overall, most developers should actually have an _easier_ time understanding the docs since the component API itself is so much simpler.

## Backwards Compatibility Analysis

This is a backwards compatible change. It only introduces new APIs, and does not require modifying the API or implementation of our existing hooks or components at all.

The collection API improvements discussed above could also be brought back to our existing hook API and to React Spectrum as well. This would require a migration path to account for the differences with our current API.

## Alternatives

We have considered a number of approaches to simplifying our existing hook-based API, and implemented many of these. Some of these include returning UI states from hooks in addition to DOM props, introducing higher level hooks such as `usePopover`, automatically passing as much as possible between hooks, improving the documentation to break up complex examples, and more.

However, there is only so far we can take this as a hooks-only library. Some React features such as context and portals are only available as components, and we are unable to provide a default DOM structure that ensures correct usage of our returned DOM props in hooks. If we want to make React Aria much easier for developers to use for common cases, a component-based API is the best way to do that.

There are many examples of other third party libraries that have successfully implemented similar libraries using a component-based approach. They offer an easier to use API at the expense of some flexibility. We have a unique opportunity to provide a library offering the best of both worlds by building a higher level abstraction on top of our already solid foundation.

## Open Questions

* In what package should we release the component API? Should it be part of the main `react-aria` monopackage, or a separate package like `react-aria-components` or `@react-aria/components`?
* What should we rename the `key` prop to? So far I've used `id` but is this confusing with DOM ids?
* How do we enable existing React Spectrum and React Aria components to use the new collection API with support for wrapping items without breaking changes?
* Which React Spectrum components should we use React Aria Components in, and how should we update existing components?

## Related Discussions

* [Consider upgrading to a component-based API](https://github.com/adobe/react-spectrum/discussions/2368)
