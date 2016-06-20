'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Search = require('../Search');

var _Search2 = _interopRequireDefault(_Search);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('Search', module).add('Default', function () {
  return render();
}).add('defaultValue (uncontrolled)', function () {
  return render({ defaultValue: 'React' });
}).add('value (controlled)', function () {
  return render({ value: 'React' });
}).add('clearable: false', function () {
  return render({ clearable: false, value: 'React' });
}).add('disabled: true', function () {
  return render({ value: 'React', disabled: true });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _react2.default.createElement(_Search2.default, _extends({
    placeholder: 'Enter text'
  }, props, {
    onChange: (0, _storybook.action)('change'),
    onSubmit: (0, _storybook.action)('submit'),
    onClear: (0, _storybook.action)('clear')
  }));
}