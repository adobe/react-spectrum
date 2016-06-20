'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Wait = require('../Wait');

var _Wait2 = _interopRequireDefault(_Wait);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('Wait', module).add('Default', function () {
  return render();
}).add('large: true', function () {
  return render({ large: true });
}).add('centered: true', function () {
  return render({ centered: true });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _react2.default.createElement(_Wait2.default, props);
}