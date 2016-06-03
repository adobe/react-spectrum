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
// Using es6
import { Button, Heading, Dialog } from 'react-coral';
```
```javascript
// Using es5
var Coral = require('react-coral');
var Button = Coral.Button;
var Heading = Coral.Heading;
var Dialog = Coral.Dialog;
```

### Testing
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
