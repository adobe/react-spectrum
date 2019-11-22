# react-spectrum <img src='https://git.corp.adobe.com/pages/brownlee/stupid-stuff/spectrum-badge.svg' height=20 />

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
registry=https://artifactory-uw2.adobeitc.com:443/artifactory/api/npm/npm-adobe-release/

_auth = [AUTH KEY]
always-auth = true
email = [ADOBE EMAIL]

@spectrum:registry=https://artifactory.corp.adobe.com:443/artifactory/api/npm/npm-spectrum-release/
//artifactory.corp.adobe.com:443/artifactory/api/npm/npm-spectrum-release/:always-auth=true
@react:registry=https://artifactory-uw2.adobeitc.com/artifactory/api/npm/npm-react-release/
//artifactory-uw2.adobeitc.com/artifactory/api/npm/npm-react-release/:always-auth=false
```

The auth key can be obtained by following the steps listed [here](https://www.jfrog.com/confluence/display/RTF/Npm+Registry#npmRegistry-UsingBasicAuthentication). Sample cURL:
```
 curl -u <ARTIFACTORY USERNAME>:<API KEY> https://artifactory-uw2.adobeitc.com:443/artifactory/api/npm/auth
```

Then you should be able to install with npm:

```
npm install @react-spectrum/dialog --save
```

### Example

```javascript
// Import root provider at the top level, it brings global page styles (CSS reset, fonts, icons, etc.)
import Provider from '@react-spectrum/Provider';

// Import the component you want to use
import Button from '@react-spectrum/Button';

// Render it!
ReactDOM.render(<Provider theme='light'><Button>Hello World</Button></Provider>, dom);
```

A few community members have created example apps to help you get started:
- Using Webpack / react-scripts: https://git.corp.adobe.com/timk/react-spectrum-template
- Using Webpack / react-scripts: https://git.corp.adobe.com/acevedoc/react-spectrum-app-example
- Using Parcel: https://git.corp.adobe.com/pfahler/react-spectrum-template

Be sure to [check if your team is already using it](https://wiki.corp.adobe.com/display/RSP/Teams+using+react+spectrum)! It could save you time!

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

### Specify themes which you want to include

You can specify the themes which you want to be included/excluded in build by passing enviroment variables to your application's build process, for example: `THEME_LIGHT=true THEME_DARK=true make build`. If you don't pass anything, all themes are imported.

In webpack, you can use `DefinePlugin` to specify environment variables. Unfortunately, you must explicitly set all of the environment variables, including the ones for themes/scales you are not using.

```javascript
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.SCALE_MEDIUM': 'true',
      'process.env.SCALE_LARGE': 'false',
      'process.env.THEME_LIGHT': 'true',
      'process.env.THEME_LIGHTEST': 'false',
      'process.env.THEME_DARK': 'false',
      'process.env.THEME_DARKEST': 'false'
    })
  ]
}
```

You can specify what theme to use at runtime using the `Provider` component which wraps your app.

```javascript
<Provider theme="dark">
  {/* YOUR APP HERE */}
</Provider>
```

### Scale support for mobile

For mobile, Spectrum has a larger scale that enables larger tap targets on all controls. By default, this scale is not built into react-spectrum's CSS. However, you can enable it using some additional environment variables, similar to the ones for themes described above. There are three cases:

* To get only the default (medium) scale, you do not need to specify any environment variables.
* To get only the large scale for mobile, specify `SCALE_LARGE=true` when building.
* To get both medium and large scale, specify `SCALE_MEDIUM=true SCALE_LARGE=true` when building.

Once you have built in the required themes into your CSS, you can switch between scales using the `Provider` component.

```javascript
<Provider theme="dark" scale="large">
  {/* YOUR APP HERE */}
</Provider>
```

### Manifest

React Spectrum allows you to import only the components you need rather than bloating your application with unused components. If you would like to import multiple components in one import statement, you can add a manifest to your own application.

## Development

### Contributing
Please read the [CONTRIBUTING](CONTRIBUTING.md) guide for an overview of how to contribute.

### Local Development

#### General
We use Yarn, please run `yarn install` instead of `npm install` to get started. If you do not have yarn, you can follow these [instructions](https://yarnpkg.com/lang/en/docs/install/#mac-stable)

#### Storybook
We use [Storybooks](https://storybooks.js.org) for local development. Run `npm start` and open [http://localhost:9002](http://localhost:9002) in your browser to play around with the components and test your changes.

#### Gatsby Documentation
Follow these steps to run documentation locally.

```
yarn install
make docs_local
```

`make docs_local` will run a pre-install (documentation project) that will build the react-spectrum project.
It will the create a file link to the build output so that gatsby can use it for imports.
To update the documentation while working on both the component and documentation, you can use a new terminal to run `make build` after updates which will update in gatsby (you can quickly restart the documentation with `npm run develop` from the documentation project root if an error occurs)

### File Layout

Each component lives in a directory under `src/`. The JavaScript lives in `src/{component}/js` and the styles
(written in [Stylus](http://stylus-lang.com)) live in `src/{component}/style`. When we build in preparation
for publishing to npm, the JavaScript is pre-compiled with [Babel](http://babeljs.io), and the stylus is
compiled to a single CSS file for each component. The directory structure is also flattened so e.g.
`import '@react/react-spectrum/Button'` works.
**Note**: For local development linking you'll need to run build. Then `cd` into the dist folder
and run `npm link` from there. That way, the import statements stay the same.

### Testing

We use [mocha](https://mochajs.org/) for unit tests and [enzyme](https://github.com/airbnb/enzyme#basic-usage) +
[assert](http://nodejs.org/api/assert.html) for writing assertions. In general, we prefer enzyme's
[shallow rendering](https://github.com/airbnb/enzyme/blob/master/docs/api/shallow.md) for tests because they are
fast and easy to maintain.  In cases where shallow rendering doesn't make sense, we use
[jsdom](https://github.com/tmpvar/jsdom) to mock the DOM and use enzyme's
[full rendering](https://github.com/airbnb/enzyme/blob/master/docs/api/mount.md) tools.

We split the tests into 2 groups.
  1. Visual tests
    - A Storybook story should be written for any visual breakage of a component.
  2. Unit tests
    - (Props) Anything that should be changed by a prop should be tested via enzyme.
    - (Events) Anything that should trigger an event should be tested via enzyme.

You can run the tests with:

```bash
npm test
```

You can also get a code coverage report by running:

```bash
make cover
```
#### Clocks
We are attempting to make more use of the mocked out clock to improve run time of tests and remove our dependency on the clock.
This also decouples our tests from our implementation. Things like requestAnimationFrame no longer need to be explicitly waited for in the tests.
Mocking the clock in this fashion can turn an async test into a synchronous test increasing readability and maintainability.
Since components are being opted into this, this needs to be added to any test suite that wants to migrate over:
mocking of the clock object
```js
let clock;

before(() => {
  clock = sinon.useFakeTimers();
});

after(() => {
  clock.runAll();
  clock.restore();
});
```
Once the clock is mocked, there are three things to use to trigger updates and events:
 - clock.tick(x)
    This function is to be used where the code in the project actually relies on real time, for instance, the `OpenTransition` component relies on the actual clock. It's also useful in tests when you want an async helper function but you want to control when it will resolve.
    A handy way to tell when this should be used: if `await sleep(x)` where x > 1, then clock.tick(x) should be used instead.
 - clock.runAll()
    This function is useful when waiting for requestAnimationFrame, even if there are nested ones, it only takes this one call, as anything added to the clock during the course of runAll will also be run.
 - tree.update()
    This function is useful when state has changed in a component and the lifecycle methods need to be activated. This is not dependent on the clock and must be called sometimes in addition to clock.runAll().

### Linting

The code is linted with [eslint](https://eslint.org/). The linter runs whenever you run the tests, but you can also run it with `make lint`.
