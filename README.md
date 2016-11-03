# react-coral
React components with [CoralUI](http://coralui.corp.adobe.com/) styles.

[![Build Status][status-image]][status-url] [![Coverage Status][coverage-image]][coverage-url] [![NPM Dependencies][npm-dependencies-image]][npm-dependencies-url] [![Storybook][storybook-image]][storybook-url]

### Why react-coral?
For the reasons behind this project, please see the [slides](http://slides.com/jeffhicken/coralui#) or [recording](https://my.adobeconnect.com/p1ghpd8opfz) for a presentation [Jeff Hicken](https://git.corp.adobe.com/hicken) and [Nate Ross](https://git.corp.adobe.com/nross) did at CoralUI Summit on June 6, 2016.

### Collaboration
We have a Slack channel `react-coral` in the Adobe Slack organization (adobe.slack.com) -- anyone can join and get help or ask questions there.  We keep our issues here in GitHub as well.  Please log new issues or add to the conversations happening there.

### Getting started
```javascript
npm install
```
```javascript
npm start
```
Navigate to http://localhost:9001 in your browser to see storyboards which demonstrate how they work.  Hot module reloading is also supported.  Change some files and watch the storyboards update automatically.

### Consuming react-coral in your project

#### Artifactory

We push builds to artifactory on a fairly regular basis.  These builds contain a `lib` directory which has all `react-coral` components transpiled with babel and ready to go without the need for any additional build steps in your project.  This is the recommended way to use `react-coral`.

This method requires node version >2.7.0 to be installed on your system.  This version of node provides support for scoped packages.

In your project, create a file named `.npmrc` with the following contents:

```
@coralui:registry=https://artifactory.corp.adobe.com/artifactory/api/npm/npm-coralui-local/
```

Install this module via npm (for best results, use the latest npm version available):

```
npm install --save @coralui/react-coral
```

You may now require `react-coral` components in your project.  Here are some ways you can do this:

```javascript
// Using es6 + module loader (webpack, browserify, jspm, SystemJS, etc)

// #1 (recommended)
// This import method allows for bundling of individual components without importing every single
// react-coral component available. This helps package managers keep library size down to a
// minimum as you only require the components you need and nothing more.
import Textfield from '@coralui/react-coral/lib/Textfield';

// #2
// This import method is convenient for importing multiple components out of react-coral at a
// time. Using this style will cause your package manager to import every single react-coral
// component into your app which may not be a big deal -- especially if you use most of the
// components offered in react-coral.
import { Button, Heading, Dialog } from '@coralui/react-coral';

// #3
// This is the same thing as #2 if you'd prefer not to use import destructuring.
import * as Coral from '@coralui/react-coral';
const Tooltip = Coral.Tooltip;
const Popover = Coral.Popover;
const Textarea = Coral.Textarea;
```

#### Alternatives

Don't want to use Artifactory?  If you have Webpack (or another package manager) set up to transpile babel/stylus files, you can compile `react-coral` components in your project's build step (make sure your `.babelrc` file matches [ours](https://git.corp.adobe.com/React/react-coral/blob/master/.babelrc)).  With this method you can npm install via GitHub ssh or https oauth and avoid npm scoping as well.  When you require `react-coral` components in your project, use the `src` directory in your require path instead of `lib` (e.g.  `react-coral/src/Textfield` instead of `@coralui/react-coral/lib/Textfield`).


#### What about CSS?

We currently don't have CoralUI CSS delivered as part of `react-coral` (see #37).  We encourage teams to include a coral.css file in their project in the meantime.  Please look [here](http://coralui.corp.adobe.com/downloads/) for instructions on how to do this.  If you need the CoralUI Shell components in your project you will have to [create a custom CoralUI build](http://coralui.corp.adobe.com/downloads/custom-builds.html) in order to bundle the CSS for these components.

### Testing
We use [mocha](https://mochajs.org/) for unit tests and [enzyme](https://github.com/airbnb/enzyme#basic-usage) + [expect](https://github.com/mjackson/expect) for writing assertions. In general, we prefer enzyme's [shallow rendering](https://github.com/airbnb/enzyme/blob/master/docs/api/shallow.md) for tests because they are fast and easy to maintain.  In cases where shallow rendering doesn't make sense, we use [jsdom](https://github.com/tmpvar/jsdom) to mock the DOM and use enzyme's [full rendering](https://github.com/airbnb/enzyme/blob/master/docs/api/mount.md) tools.

We split the tests into 2 groups.
  1. Visual tests
    - A Storybook story should be written for any visual breakage of a component.
  2. Unit tests
    - (Props) Anything that should be changed by a prop should be tested via enzyme.
    - (Events) Anything that should trigger an event should be tested via enzyme.

#### Running Tests
Run tests once
```javascript
npm test
```
Run tests if source or test files change (TDD)
```javascript
npm run test:watch
```

#### Running Coverage Reports
```javascript
npm run coverage
```

#### Running Javascript linter
```javascript
npm run lint
```

[status-url]: https://sparkle.ci.corp.adobe.com:12001/job/mcdp-react-coral-unit-tests-develop
[status-image]: https://sparkle.ci.corp.adobe.com:12001/buildStatus/icon?job=mcdp-react-coral-unit-tests-develop
[coverage-url]: https://sparkle.ci.corp.adobe.com:12001/view/MCDP%20UI/job/mcdp-react-coral-unit-tests-develop/lastStableBuild/cobertura/
[coverage-image]: https://sparkle.ci.corp.adobe.com:12001/view/MCDP%20UI/job/mcdp-react-coral-unit-tests-develop/ws/badges/coverage.svg
[npm-dependencies-url]: https://sparkle.ci.corp.adobe.com:12001/view/MCDP%20UI/job/mcdp-react-coral-unit-tests-develop/ws/badges/dependencies.txt
[npm-dependencies-image]: https://sparkle.ci.corp.adobe.com:12001/view/MCDP%20UI/job/mcdp-react-coral-unit-tests-develop/ws/badges/dependencies.svg
[storybook-url]: https://sparkle.ci.corp.adobe.com:12001/view/MCDP%20UI/job/mcdp-react-coral-unit-tests-develop/Storybook/
[storybook-image]: https://sparkle.ci.corp.adobe.com:12001/view/MCDP%20UI/job/mcdp-react-coral-unit-tests-develop/ws/badges/storybook.svg
