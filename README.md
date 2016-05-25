# react-coral
React components using cloudui style guidelines from CoralUI

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
