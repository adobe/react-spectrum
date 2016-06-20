'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Heading = require('../Heading');

var _Heading2 = _interopRequireDefault(_Heading);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('Heading', module).add('h1', function () {
  return render();
}).add('h2', function () {
  return render({ size: 2 });
}).add('h3', function () {
  return render({ size: 3 });
}).add('h4', function () {
  return render({ size: 4 });
}).add('h5', function () {
  return render({ size: 5 });
}).add('h6', function () {
  return render({ size: 6 });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _react2.default.createElement(
    _Heading2.default,
    props,
    'React'
  );
}