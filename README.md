#  react-spectrum
[Spectrum](http://spectrum.adobe.com) UI components in React.

## ⚠️ Under Construction  ⚠️
We are currently working hard to be ready for a stable release.

  - Please *don't share* this repo until we make our public announcement!
  - Please try out our RC components and [tell us](https://github.com/adobe-private/react-spectrum-v3/issues/new/choose) what you think!

## Overview ##
React Spectrum is a UI Component Library leveraging Spectrum, Adobe's Design System. It will enable you to easily build apps with plug and play UI components that match Adobe's look and feel. Some features of React Spectrum include: 

#### Built-in Accessibility and Keyboard support ⌨️:
Save development time with out-of-the-box accessibility and keyboard support. 

#### Custom Theme support, including Dark Mode 🌘:
Provide a custom theme that can be applied to all components. 

#### Mobile/Cross Platform support 📱:
Components are responsive and work across all browsers and devices. 

#### Internationalization support 💬:
Translations for 31 languages are provided, including reconfigured components for Right-to-Left languages. 

## Using react-spectrum in your project

react-spectrum is usable with a module bundler like [Parcel](https://parceljs.org).
Components are then usable as in the following example. The styles for each component you import will be bundled
along-side the JavaScript (more on configuring this below). Each component should be imported independently -
this way only the components you use will be included in the output JavaScript and CSS files.

### Installation

```
yarn add @react-spectrum/provider @react-spectrum/theme-default @react-spectrum/button
```

### Example

```javascript
// Import root provider and theme
import {Provider} from '@react-spectrum/provider';
import {theme} from '@react-spectrum/theme-default';

// Import the component you want to use
import {Button} from '@react-spectrum/button';

// Render it!
ReactDOM.render(
  <Provider theme={theme}>
    <Button variant="cta">Hello World</Button>
  </Provider>
, dom);
```

## Development

#### General
We use Yarn, please run `yarn install` instead of `npm install` to get started. If you do not have yarn, you can follow these [instructions](https://yarnpkg.com/lang/en/docs/install/#mac-stable)

#### Storybook
We use [Storybooks](https://storybooks.js.org) for local development. Run `yarn start` and open [http://localhost:9003](http://localhost:9003) in your browser to play around with the components and test your changes.

### File Layout

React Spectrum is organized into many npm packages in a monorepo, managed by [Lerna](http://lerna.js.org). Our architecture splits each component into three parts: @react-stately (state management), @react-aria (behavior + accessibility), and @react-spectrum (spectrum themed components).

### Testing

We use [jest](https://jestjs.io/) for unit tests and [react-testing-library](https://testing-library.com/docs/react-testing-library/intro) for rendering and writing assertions.

We split the tests into 2 groups.
  1. Visual tests
    - A Storybook story should be written for any visual breakage of a component.
  2. Unit tests
    - (Props) Anything that should be changed by a prop should be tested via react-testing-library.
    - (Events) Anything that should trigger an event should be tested via react-testing-library.

You can run the tests with:

```bash
yarn jest
```

You can also get a code coverage report by running:

```bash
yarn jest --coverage
```

### TypeScript

The code for React Spectrum is written in [TypeScript](https://www.typescriptlang.org/). The type checker will usually run in your editor, but also runs when you run `make lint`.

### Linting

The code is linted with [eslint](https://eslint.org/). The linter runs whenever you run the tests, but you can also run it with `make lint`.
