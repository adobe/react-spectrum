# [React Aria](https://react-spectrum.adobe.com/react-aria/hooks.html)

A library of React Hooks that provides accessible UI primitives for your design system.

## Features

* ♿️ **Accessible** – React Aria provides accessibility and behavior according to [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.2/), including full screen reader and keyboard navigation support. All components have been tested across a wide variety of screen readers and devices to ensure the best experience possible for all users.
* 📱 **Adaptive** – React Aria ensures consistent behavior, no matter the UI. It supports mouse, touch, keyboard, and screen reader interactions that have been tested across a wide variety of browsers, devices, and platforms.
* 🌍 **International** – React Aria supports over 30 languages, including right-to-left-specific behavior, internationalized date and number formatting, and more.
* 🎨 **Fully customizable** – React Aria doesn’t implement any rendering or impose a DOM structure, styling methodology, or design-specific details. It provides behavior, accessibility, and interactions and lets you focus on your design.

## Getting started

The easiest way to start building a component library with React Aria is by following our [getting started](https://react-spectrum.adobe.com/react-aria/hooks.html) guide. It walks through all of the steps needed to install the hooks from npm, and create your first component.

### Example

Here is a very basic example of using React Aria.

```jsx
import {useButton} from '@react-aria/button';

function Button(props) {
  let ref = React.useRef();
  let {buttonProps} = useButton(props, ref);

  return (
    <button {...buttonProps} ref={ref}>
      {props.children}
    </button>
  );
}

<Button onPress={() => alert('Button pressed!')}>Press me</Button>
```

## Learn more

React Aria is part of a family of libraries that help you build adaptive, accessible, and robust user experiences.
Learn more about [React Spectrum](https://react-spectrum.adobe.com/react-spectrum/index.html) and [React Stately](https://react-spectrum.adobe.com/react-stately/index.html) on [our website](https://react-spectrum.adobe.com/index.html).
