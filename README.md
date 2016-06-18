# react-coral
React components using cloudui style guidelines from CoralUI

[![Build Status][status-image]][status-url] [![Coverage Status][coverage-image]][coverage-url] [![NPM Dependencies][npm-dependencies-image]][npm-dependencies-url] [![Storybook][storybook-image]][storybook-url]

### Getting started
```javascript
npm install
```
```javascript
npm start
```
Navigate to http://localhost:9001 in your browser to see storyboards which demonstrate how the components work.  Hot module reloading is also supported.  Change some files and watch the storyboards update automatically.
### Running Tests
Run tests once
```javascript
npm test
```
Run tests if source or test files change (TDD)
```javascript
npm run test:watch
```
### Running Coverage Reports
```javascript
npm run coverage
```
### Running Javascript linter
```javascript
npm run lint
````
### Consuming react-coral in your project
Current react-coral doesn't have a build system at this point. Instead, we intend on having the codebase which depends on react-coral to use its own bundling framework (e.g. webpack, browserify, jspm, etc). This can be done by doing the following (after adding react-coral as a dependency to your project):
```javascript
// Using es6 + module loader (webpack, browserify, jspm, SystemJS, etc)

// #1
// This import method allows for bundling of individual components without importing every single react-coral
// component that is available. Keeps library size down to a minimum as you only require the components you
// need and nothing more.
import Textfield from 'react-coral/dist/Textfield';

// #2
// This import method is convenient for grabbing multiple components out of react-coral. Using this style 
// will pull every single react-coral component into your app which may not be a big deal -- especially if
// you use the majority of CoralUI components.
import { Button, Heading, Dialog } from 'react-coral'; // Import a handful of components at a time

// #3
// This is essentially the same thing as #2.
import * as Coral from 'react-coral';
const Tooltip = Coral.Tooltip;
const Popover = Coral.Popover;
const Textarea = Coral.Textarea;
```

### Testing
We use [mocha](https://mochajs.org/) for unit tests and [enzyme](https://github.com/airbnb/enzyme#basic-usage) + [expect](https://github.com/mjackson/expect) for writing assertions. In general, we prefer enzyme's [shallow rendering](https://github.com/airbnb/enzyme/blob/master/docs/api/shallow.md) for tests because they are fast and easy to maintain.  In cases where shallow rendering doesn't make sense, we use [jsdom](https://github.com/tmpvar/jsdom) to mock the DOM and use enzyme's [full rendering](https://github.com/airbnb/enzyme/blob/master/docs/api/mount.md) tools.

We split the tests into 2 groups.
  1. Visual tests
    - A Storybook story should be written for any visual breakage of a component.
  2. Unit tests
    - (Props) Anything that should be changed by a prop should be tested via enzyme.
    - (Events) Anything that should trigger an event should be tested via enzyme.

[status-url]: https://sparkle.ci.corp.adobe.com:12001/job/mcdp-react-coral-unit-tests-develop
[status-image]: https://sparkle.ci.corp.adobe.com:12001/buildStatus/icon?job=mcdp-react-coral-unit-tests-develop
[coverage-url]: https://sparkle.ci.corp.adobe.com:12001/view/MCDP%20UI/job/mcdp-react-coral-unit-tests-develop/lastStableBuild/cobertura/
[coverage-image]: https://sparkle.ci.corp.adobe.com:12001/view/MCDP%20UI/job/mcdp-react-coral-unit-tests-develop/ws/badges/coverage.svg
[npm-dependencies-url]: https://sparkle.ci.corp.adobe.com:12001/view/MCDP%20UI/job/mcdp-react-coral-unit-tests-develop/ws/badges/dependencies.txt
[npm-dependencies-image]: https://sparkle.ci.corp.adobe.com:12001/view/MCDP%20UI/job/mcdp-react-coral-unit-tests-develop/ws/badges/dependencies.svg
[storybook-url]: https://sparkle.ci.corp.adobe.com:12001/view/MCDP%20UI/job/mcdp-react-coral-unit-tests-develop/Storybook/
[storybook-image]: https://sparkle.ci.corp.adobe.com:12001/view/MCDP%20UI/job/mcdp-react-coral-unit-tests-develop/ws/badges/storybook.svg
