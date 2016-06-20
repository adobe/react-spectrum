'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Alert = require('../Alert');

var _Alert2 = _interopRequireDefault(_Alert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('./buildGlobalScript.js').default(".coral3-Alert%7Btext-align:left%7D");

(0, _storybook.storiesOf)('Alert', module).add('Default', function () {
  return render();
}).add('header', function () {
  return render({ header: 'info' });
}).add('variant: help', function () {
  return render({ header: 'help', variant: 'help' });
}).add('variant: success', function () {
  return render({ header: 'success', variant: 'success' });
}).add('variant: error', function () {
  return render({ header: 'error', variant: 'error' });
}).add('variant: warning', function () {
  return render({ header: 'warning', variant: 'warning' });
}).add('large: true', function () {
  return render({ header: 'Info', large: true });
}).add('closable: true', function () {
  return render({ header: 'Info', closable: true });
}).add('large: true, closable: true', function () {
  return render({ header: 'Info', large: true, closable: true });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var children = arguments.length <= 1 || arguments[1] === undefined ? 'This is a React Coral alert' : arguments[1];

  return _react2.default.createElement(
    _Alert2.default,
    _extends({
      onClose: (0, _storybook.action)('close')
    }, props),
    children
  );
}