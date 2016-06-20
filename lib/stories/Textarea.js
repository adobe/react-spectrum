'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Textarea = require('../Textarea');

var _Textarea2 = _interopRequireDefault(_Textarea);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('Textarea', module).add('Default', function () {
  return render();
}).add('quiet: true', function () {
  return render({ quiet: true });
}).add('disabled: true', function () {
  return render({ disabled: true });
}).add('invalid: true', function () {
  return render({ invalid: true });
}).add('readOnly: true', function () {
  return render({ readOnly: true });
}).add('required: true', function () {
  return render({ required: true });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _react2.default.createElement(_Textarea2.default, _extends({
    placeholder: 'React',
    onChange: (0, _storybook.action)('change'),
    onFocus: (0, _storybook.action)('focus'),
    onBlur: (0, _storybook.action)('blur')
  }, props));
}