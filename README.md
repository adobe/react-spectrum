# react-spectrum

[Spectrum](http://spectrum.corp.adobe.com) UI components in React.

## Why react-spectrum?

react-spectrum is a fork of the [react-coral](http://git.corp.adobe.com/React/react-coral) project, updated for
the new [Spectrum](http://spectrum.corp.adobe.com) design language. The styles were originally from
[coralui-theme-spectrum](http://git.corp.adobe.com/Coral/coralui-theme-spectrum), however most of the underlying styles
now live in [spectrum-css](http://git.corp.adobe.com/Spectrum/spectrum-css).

Since react-spectrum has a different DOM structure in some cases from CoralUI, it made sense to bring in the styles so we
can adjust the selectors as necessary. We also wanted to take advantage of some modern JavaScript tooling
which allows automatically building only the JavaScript and CSS that you actually use in your project based on
which modules you `import` or `require`.

## Using react-spectrum in your project

react-spectrum is usable with a module bundler like [Browserify](http://browserify.org) or [Webpack](https://webpack.js.org).
Components are then `require`able as in the following example. The styles for each component you import will be bundled
along-side the JavaScript (more on configuring this below). Each component should be imported independently -
this way only the components you use will be included in the output JavaScript and CSS files.

### Installation

Add the following to your `~/.npmrc`:

```
@react:registry=https://artifactory.corp.adobe.com:443/artifactory/api/npm/npm-react-release/
//artifactory.corp.adobe.com:443/artifactory/api/npm/npm-react-release/:always-auth=false
```

Then you should be able to install with npm:

```
npm install @react/react-spectrum --save
```

### Example

```javascript
// Import root provider at the top level, it brings global page styles (CSS reset, fonts, icons, etc.)
import '@react/react-spectrum/Provider';

// Import the component you want to use
import Button from '@react/react-spectrum/Button';

// Render it!
ReactDOM.render(<Provider theme='light'><Button>Hello World</Button></Provider>, dom);
```

### Browserify

To use react-spectrum with browserify, you will need a plugin to extract the CSS into a separate file.
One such plugin is [text-extractify](https://github.com/TiddoLangerak/text-extractify). This will build
a CSS file containing all of the required styles for the components you imported.

With the browserify CLI:

```bash
browserify app.js -p [ text-extractify --exts css --dest out.css ] -o out.js
```

Or with the browserify API:

```javascript
b.plugin('text-extractify', {
  exts: ['css'],
  dest: 'out.css'
});
```

### Webpack

To use react-spectrum, you'll need [css-loader](https://github.com/webpack-contrib/css-loader) and either
[style-loader](https://github.com/webpack-contrib/style-loader) to inject the styles
directly into the DOM, or [extract-text-webpack-plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin)
to extract the CSS to a single separate file.

```javascript
module.exports = {
  module: {
    loaders: [
      {
        test: /\.css/,
        loaders: ['style', 'css']
      }
    ]
  }
}
```

### Specify themes which you want to include

You can specify the themes which you want to be included/excluded in build by passing enviroment variables to your application's build process, for example: `THEME_LIGHT=true THEME_DARK=true make build`. If you don't pass anything, all themes are imported.

In webpack, you can use `DefinePlugin` to specify environment variables.

```javascript
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.THEME_LIGHTEST': 'true',
      'process.env.THEME_DARKEST': 'true'
    })
  ]
}
```

### Manifest

React Spectrum allows you to import only the components you need rather than bloating your application with unused components. If you would like to import multiple components in one import statement, you can add a manifest to your own application.

## Development

### Contributing
Please read the [CONTRIBUTING](CONTRIBUTING.md) guide for an overview of how to contribute.

### Local Development

We use [Storybooks](https://storybooks.js.org) for local development. Run `npm start` and open (http://localhost:9002)[http://localhost:9002] in your browser to play around with the components and test your changes.

### File Layout

Each component lives in a directory under `src/`. The JavaScript lives in `src/{component}/js` and the styles
(written in [Stylus](http://stylus-lang.com)) live in `src/{component}/style`. When we build in preparation
for publishing to npm, the JavaScript is pre-compiled with [Babel](http://babeljs.io), and the stylus is
compiled to a single CSS file for each component. The directory structure is also flattened so e.g.
`import '@react/react-spectrum/Button'` works.

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

### Linting

The code is linted with [lfeslint](https://github.com/Livefyre/lfeslint). The linter runs whenever you run the tests, but
you can also run it with `make lint`.
