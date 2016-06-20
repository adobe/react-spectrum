'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Switch = require('../Switch');

var _Switch2 = _interopRequireDefault(_Switch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('Switch', module).add('Default', function () {
  return render();
}).add('defaultChecked: true', function () {
  return render({ defaultChecked: true });
}).add('checked: true', function () {
  return render({ checked: true });
}).add('checked: false', function () {
  return render({ checked: false });
}).add('disabled: true', function () {
  return render({ disabled: true });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _react2.default.createElement(_Switch2.default, _extends({
    onChange: (0, _storybook.action)('change')
  }, props));
}