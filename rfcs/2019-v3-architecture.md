<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2019-02-22
- RFC PR: (leave this empty, to be filled in later)
- Authors: Devon Govett

# React Spectrum v3 Architecture

## Summary

React Spectrum has had the same general architecture since its inception over 2 years ago. As it has grown, the components have gotten much larger with features like accessibility, keyboard support, internationalization, and more. Additionally, new platforms such as UXP have enabled React Spectrum components to run in more environments with different backing implementations. For React Spectrum v3, a new architecture is proposed taking advantage of [Hooks](https://reactjs.org/docs/hooks-intro.html) in React 16.8, which abstracts components into three reusable pieces: platform agnostic state management, theme agnostic behavior, and themed components. This will allow new platforms to reuse common state, and new themes to utilize common behavior while getting accessibility and more out of the box.

## Motivation

Today, many companies are implementing their own component libraries for their design systems from scratch. The primitives of the web give them divs and other HTML tags for structure, CSS for styling, and JavaScript for interaction. Many component libraries are written using a framework like React, which makes declarative UI development easier. However, properly implementing support for things like accessibility, internationalization, keyboard interactions, and other advanced features is very hard and many companies simply do not have the resources or time to prioritize this properly. This leads to inaccessible applications and sub-par experiences shipping to production, and contributes to the perception of the web as an inferior app platform compared to native apps.

In addition, use of JavaScript has spread beyond only the web platform. Platforms like React Native and UXP (Torq Native) have allowed React to render native widgets as well, and this will only expand as more rendering surfaces become available, e.g AR/VR. It should be possible to reuse the same UI components across multiple platforms, or at least the public interface to these components. The underlying implementation should be swappable per platform.

Many of these issues could be solved if component libraries could start from a base component framework, which would implement the functionality, logic, interactions, accessibility, internationalization, and more, but with no styling included. This way, each company could style the components however they wanted, and produce a feature rich component library with much less effort. In addition, applications would be more portable across platforms since they could share a public interface everywhere.

In order to build such a component library, an extensible architecture needs to be developed to separate the behavior and styling of each component from the core implementation. This architecture should allow developers of design systems to change the styling, interactions, and behavior of each component in a flexible way with minimal effort, while starting from a full-featured base.

## Detailed Design

### Architecture

Each component in React Spectrum v3 will be broken into at most three parts, enabled by the new [Hooks](https://reactjs.org/docs/hooks-intro.html) feature in React 16.8. Some components will not have all of these pieces. For example, some simple components do not require any state, and others may be only compositions of other components.


- **State hook** - a React hook, shared across platforms. Accepts common props from the component, and provides state management. Supports controlled and uncontrolled modes. No UI is rendered here, just common state management that can be shared across multiple platform dependent UI implementations.
- **Behavior hook** - a React hook which provides props to be passed to certain children by the component for a particular platform, e.g. web or native. Implements event handling, focus management, accessibility, internationalization, etc. and updates the component’s state via the state hook as needed. Possibly has platform specific UI state of its own (e.g. focus state for classes, etc.). In general, a behavior hook should exist for every [ARIA widget](https://www.w3.org/TR/wai-aria-practices-1.1/#aria_ex).
- **Themed component** - the actual component used by applications. Provides the DOM structure required to implement a specific theme, e.g. the proper class names and elements. Uses props from the behavior hook and state from the state hook.

### State Hook

The following example shows what a state hook for an autocomplete component might look like. It accepts props from whatever component uses it, and returns state along with functions to update that state and perform common actions. This interface should be documented and follow semantic versioning since other components besides the ones included in react-spectrum may use it.

```jsx
import { useState, useMemo } from "react";

export function useAutocomplete(props) {
  let [showMenu, setShowMenu] = useState(false);
  let [value, setValue] = useState(props.value || "");
  let [selectedIndex, setSelectedIndex] = useState(null);
  let completions = useMemo(
    () =>
      props.options.filter(option =>
        option.toLowerCase().startsWith(value.toLowerCase())
      ),
    [props.options, value]
  );
  
  return {
    showMenu: showMenu && completions.length > 0,
    setShowMenu,
    toggleMenu: () => setShowMenu(!showMenu),
    value,
    setValue: value => {
      if (value && !showMenu) {
        setShowMenu(true);
      }
      setSelectedIndex(null);
      setValue(value);
      props.onChange(value);
    },
    selectedIndex,
    setSelectedIndex,
    completions,
    selectItem: index => {
      setValue(completions[index]);
      setShowMenu(false);
      props.onChange(completions[index]);
    }
  };
}
```

### Behavior Hook

The following example shows what the behavior hook for a combo box component might look like. It accepts props from the component along with state from the autocomplete state hook, and returns theme-agnostic props for several elements to be rendered by the component. It implements the component’s behavior, including keyboard and mouse interactions, accessibility attributes, and anything else that is theme agnostic. The interface for this should also be documented and properly versioned since other components outside of spectrum may wish to reuse the common implementation that we provide.

```jsx
import { useRef } from "react";
import { useId } from "./utils";

export function useComboBox(props, autocomplete) {
  let id = useId(props.id);
  let listboxId = useId();
  let textfieldRef = useRef();
  let values = { ...autocomplete, id, listboxId, textfieldRef };
  return {
    wrapperProps: getWrapperProps(values),
    textfieldProps: getTextfieldProps(values),
    buttonProps: getButtonProps(values),
    menuProps: getMenuProps(values),
    getMenuItemProps: index => getMenuItemProps(values, index)
  };
}

function getWrapperProps({ listboxId, showMenu }) {
  return {
    role: "combobox",
    "aria-controls": showMenu ? listboxId : undefined,
    "aria-owns": showMenu ? listboxId : undefined,
    "aria-expanded": showMenu,
    "aria-haspopup": "true"
  };
}

function getTextfieldProps({
  selectedIndex,
  setSelectedIndex,
  completions,
  value,
  setValue,
  selectItem,
  listboxId,
  showMenu,
  setShowMenu,
  textfieldRef
}) {
  let onKeyDown = e => {
    switch (e.key) {
      case "ArrowDown":
        setSelectedIndex(
          selectedIndex == null ? 0 : (selectedIndex + 1) % completions.length
        );
        break;
      case "ArrowUp":
        setSelectedIndex(
          selectedIndex == null
            ? completions.length - 1
            : (selectedIndex - 1 + completions.length) % completions.length
        );
        break;
      case "Enter":
        selectItem(selectedIndex);
        break;
      case "Escape":
        setShowMenu(false);
        break;
    }
  };
  
  return {
    value,
    ref: textfieldRef,
    onChange: e => setValue(e.target.value),
    "aria-controls": showMenu ? listboxId : undefined,
    "aria-autocomplete": "list",
    "aria-activedescendant":
      showMenu && selectedIndex !== null
        ? listboxId + "-option-" + selectedIndex
        : undefined,
    role: "textbox",
    autoComplete: "off",
    onKeyDown: onKeyDown,
    onBlur: () => setShowMenu(false),
    onFocus: () => {
      if (value) {
        setShowMenu(true);
      }
    }
  };
}

function getButtonProps({ toggleMenu, textfieldRef }) {
  return {
    tabIndex: "-1",
    onMouseDown: e => e.preventDefault(),
    onMouseUp: e => e.preventDefault(),
    onClick: () => {
      textfieldRef.current.focus();
      toggleMenu();
    }
  };
}

function getMenuProps({ listboxId }) {
  return {
    id: listboxId,
    role: "listbox"
  };
}

function getMenuItemProps(
  { listboxId, selectedIndex, setSelectedIndex, selectItem },
  index
) {
  return {
    role: "option",
    id: listboxId + "-option-" + index,
    tabIndex: selectedIndex === index ? 0 : -1,
    "aria-selected": selectedIndex === index,
    onMouseEnter: () => setSelectedIndex(index),
    onMouseDown: e => e.preventDefault(),
    onClick: () => selectItem(index)
  };
}
```

### Component

The following example shows what a ComboBox component might look like. It uses the autocomplete state hook along with props from the combo box behavior hook, and renders the actual DOM structure needed for the Spectrum theme. In general, components themselves should be quite small and mostly stateless, since state and behavior are provided by theme-agnostic hooks.

```jsx
import {useAutocomplete} from '@react-state/autocomplete';
import {useComboBox} from '@react-aria/combo-box';
import {Textfield} from '@react-spectrum/textfield';
import {Button} from '@react-spectrum/button';
import {AutocompleteMenu} from '@react-spectrum/autocomplete';

function ComboBox(props) {
  let autocomplete = useAutocomplete(props);
  let {
    wrapperProps,
    textfieldProps,
    buttonProps,
    menuProps
  } = useComboBox(props, autocomplete);
  
  return (
    <div {...wrapperProps} className="spectrum-InputGroup">
      <Textfield
        {...textfieldProps}
        className="spectrum-InputGroup-field" />
      <Button
        {...buttonProps}
        variant="field" />
      <AutocompleteMenu
        {...menuProps} />
    </div>
  );
}
```

### Packages and File Structure

In order for each of the three pieces of each component to be used independently, they should be published as separate npm packages. This allows authors of other themed components to depend only on code they use rather than all of the Spectrum specific things. React Spectrum packages will depend on the state and behavior hook packages.

There will be a separate RFC to propose the individual versioning of react-spectrum packages, and the naming of these package orgs is still up for debate, but the general structure should be:

  - `@react-state/combo-box` - state hook
  - `@react-aria/combo-box` - behavior hook implementation for web
  - `@react-spectrum/combo-box` - themed spectrum component

In terms of folder structure inside the react-spectrum repo, a two level folder tree could be used. This groups the three parts of each component together within a single folder, even though they are separate packages, which should make it slightly easier to find things in the repo. Again, see the monorepo RFC for more details on the motivation behind splitting everything into separate packages.

    packages
    └── combo-box
        ├── aria
        │   ├── package.json
        │   ├── src
        │   │   └── useComboBox.js
        │   └── test
        │       └── useComboBox.js
        ├── component
        │   ├── package.json
        │   ├── src
        │   │   └── ComboBox.js
        │   └── test
        │       └── ComboBox.js
        └── state
            ├── package.json
            ├── src
            │   └── useAutocomplete.js
            └── test
                └── useAutocomplete.js

## Documentation

While no API changes are necessarily required to the components currently consumed by react-spectrum in applications, this is a major change to the way we build components internally. It adds a lot of API surface area since consumers can use the state or behavior hooks directly in their own custom components. Those interfaces will need to be documented. There should also be documentation about the architecture described above, and how components should be structured for contributors to react-spectrum.

## Drawbacks

This is a major change to the way we build components in react-spectrum, and it will require a lot of refactoring for every component in the library. This will be a lot of work, and it will take time and resources to make it happen.

In addition, the new architecture is quite a bit more complex, and it may cause confusion for contributors. Previously, it was fairly obvious where to look when a bug came up - in the component or in spectrum-css. Now, there will be many more possible places to look. In addition, contributing new components will be more complex, and new contributors may not be aware, or may not understand the architecture.

## Backwards Compatibility Analysis

No component API changes are necessarily required by this refactor, but implementation details will change significantly so there may be unintended breakages or changes in behavior. Additionally, the use of React Hooks requires clients to upgrade to React 16.8 or later. Therefore, this change must be in a major version release.

## Alternatives

Several alternatives were considered prior to the release of React Hooks, but they all had various problems. In particular, we had looked into using higher order components, and render props. These generally cause a lot of boilerplate code, required much greater component nesting which makes debugging more challenging, and made it harder to compose components together and pass state around. Hooks solve all of these problems quite elegantly by allowing shared state and behavior to be tied to a single component instance without subclassing or other hacks.

## Open Questions

- **Package naming** - We need better names for the package orgs (e.g. `@react-state`  and `@react-aria`). These need to be publicly available on npm for when we open source.
- **File structure** - Is the file structure proposed above confusing? Is there too much boilerplate for each component? How could we do it better?

## Frequently Asked Questions

### Why are you doing this refactor?

- We want to enable platforms like UXP to reuse cross-platform code in react-spectrum while being able to provide their own platform-specific rendering.
- For our open source release, we want to enable other potential users of react-spectrum to take advantage of the work we’ve put into the theme agnostic behavior, accessibility, internationalization, and more in react-spectrum without necessarily needing to use the spectrum design.
- We want to better abstract the various parts of our components so they are smaller and easier to reason about.

### Will this include breaking API changes?

While this proposal does not necessarily require API changes to the props of existing components, it will be done in a major release because it will require React 16.8. Other unrelated breaking changes will likely also occur in that major release.

### How do I upgrade my application?

Upgrade to React 16.8 and React Spectrum 3.0.

### What is the timeline for this change?

This is a major refactor so it will take significant time and resources. There is no immediate timeline for a release at this point.

## Related Discussions

- [react-spectrum-uxp](https://git.corp.adobe.com/torq/react-spectrum-uxp)
- [Presentation on previous approaches considered for UXP](https://cocky-wright-d19a05.netlify.com/0)
- [Prototype of stateless components for UXP](https://git.corp.adobe.com/React/react-spectrum/compare/jasper/stateless-prototype)
- [reach-ui](http://github.com/reach/reach-ui) - third party library implementing style-less components with accessibility in mind
