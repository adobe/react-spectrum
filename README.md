# react-spectrum v3

[Spectrum](http://spectrum.corp.adobe.com) UI components in React.

## Using react-spectrum in your project

react-spectrum is usable with a module bundler like [Parcel](https://parceljs.org) or [Webpack](https://webpack.js.org).
Components are then `require`able as in the following example. The styles for each component you import will be bundled
along-side the JavaScript (more on configuring this below). Each component should be imported independently -
this way only the components you use will be included in the output JavaScript and CSS files.

### Installation
#### Node
We recommend that you use [NVM](https://github.com/creationix/nvm#installation) to manage your node version.
NVM has a section in their documentation to handle using the right version automatically when cd'ing into a project with a `.nvmrc` file [documentation](https://github.com/creationix/nvm#nvmrc)
If you are manually managing your version of Node, then refer to `.nvmrc` for the version you should run with.

#### NPM
Add the following to your `~/.npmrc`:

```
@react-aria:registry=https://artifactory-uw2.adobeitc.com/artifactory/api/npm/npm-rsp-tmp-release/
@react-spectrum:registry=https://artifactory-uw2.adobeitc.com/artifactory/api/npm/npm-rsp-tmp-release/
@react-stately:registry=https://artifactory-uw2.adobeitc.com/artifactory/api/npm/npm-rsp-tmp-release/
@react-types:registry=https://artifactory-uw2.adobeitc.com/artifactory/api/npm/npm-rsp-tmp-release/
@spectrum-icons:registry=https://artifactory-uw2.adobeitc.com/artifactory/api/npm/npm-rsp-tmp-release/
//artifactory-uw2.adobeitc.com/artifactory/api/npm/npm-rsp-tmp-release/:_password=YOUR_PASSWORD_HERE
//artifactory-uw2.adobeitc.com/artifactory/api/npm/npm-rsp-tmp-release/:username=YOUR_USERNAME_HERE
//artifactory-uw2.adobeitc.com/artifactory/api/npm/npm-rsp-tmp-release/:email=YOUR_USERNAME_HERE@adobe.com
//artifactory-uw2.adobeitc.com/artifactory/api/npm/npm-rsp-tmp-release/:always-auth=true
```

Then you should be able to install with npm:
Eventually we'll support a single package with all of them, but for now you must install individual ones

```
npm install @react-spectrum/provider @react-spectrum/theme-default @react-spectrum/button --save
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

### Webpack

To use react-spectrum, you'll need [css-loader](https://github.com/webpack-contrib/css-loader) and either
[style-loader](https://github.com/webpack-contrib/style-loader) to inject the styles
directly into the DOM, or [extract-text-webpack-plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin)
to extract the CSS to a single separate file.

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css/,
        loaders: ['style-loader', 'css-loader']
      }
    ]
  }
}
```

### Parcel

No additional configuration is needed to use react-spectrum with Parcel. 😇

## Development

### Local Development

#### General
We use Yarn, please run `yarn install` instead of `npm install` to get started. If you do not have yarn, you can follow these [instructions](https://yarnpkg.com/lang/en/docs/install/#mac-stable)

#### Storybook
We use [Storybooks](https://storybooks.js.org) for local development. Run `yarn start` and open [http://localhost:9003](http://localhost:9003) in your browser to play around with the components and test your changes.

### File Layout
React Spectrum v3 is organized into many npm packages in a monorepo, managed by [Lerna](http://lerna.js.org). Our architecture splits each component into three parts: @react-stately (state management), @react-aria (behavior + accessibility), and @react-spectrum (spectrum themed components).

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

The code for React Spectrum v3 is written in [TypeScript](https://www.typescriptlang.org/). The type checker will usually run in your editor, but also runs when you run `make lint`.

### Linting

The code is linted with [eslint](https://eslint.org/). The linter runs whenever you run the tests, but you can also run it with `make lint`.
