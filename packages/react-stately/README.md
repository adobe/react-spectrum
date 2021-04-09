# [React Stately](https://react-spectrum.adobe.com/react-stately/index.html)

A library of React Hooks that provides cross-platform state management for your design system.

## Features

* 🏠 **Foundational** – React Stately provides the foundation and core logic for your component library. It handles state management for common components through an easy-to-use interface.
* 📱 **Cross-platform** – React Stately only provides state management, with no assumptions about the DOM or other view systems.
* ⚓️ **Powered by React Hooks** – React Stately is implemented as a library of React Hooks, which allows you to adapt them to your needs through composition.
* 🎨 **Design agnostic** – React Stately doesn’t make any assumptions about your design. It provides state management that’s intrinsic to the functionality of the component.

## Getting started

The easiest way to start building a component library with React Stately is by following our [getting started](https://react-spectrum.adobe.com/react-stately/getting-started.html) guide. It walks through all of the steps needed to install the hooks from npm, and create your first component.

### Example

Here is a very basic example of using React Aria.

```jsx
import {useRadioGroupState} from '@react-stately/radio';

function RadioGroup(props) {
  let state = useRadioGroupState(props);

  return (
    <>
      <label>
        <input
          type="radio"
          name={state.name}
          checked={state.selectedValue === 'dogs'}
          onChange={() => state.setSelectedValue('dogs')}
        />
        Dogs
      </label>
      <label>
        <input
          type="radio"
          name={state.name}
          checked={state.selectedValue === 'cats'}
          onChange={() => state.setSelectedValue('cats')}
        />
        Cats
      </label>
    </>
  );
}

<RadioGroup
  defaultValue="dogs"
  onChange={(value) => alert(`Selected ${value}`)}
/>
```

## Learn more

React Stately is part of a family of libraries that help you build adaptive, accessible, and robust user experiences.
Learn more about [React Spectrum](https://react-spectrum.adobe.com/react-spectrum/index.html) and [React Aria](https://react-spectrum.adobe.com/react-aria/index.html) on [our website](https://react-spectrum.adobe.com/index.html).
