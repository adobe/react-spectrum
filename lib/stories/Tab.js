'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Tab = require('../Tab');

var _Tab2 = _interopRequireDefault(_Tab);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('Tab', module).addDecorator(function (story) {
  return _react2.default.createElement(
    'div',
    { style: { textAlign: 'left', margin: '0 100px' } },
    story()
  );
}).add('Default', function () {
  return render();
}).add('icon: add', function () {
  return render({ icon: 'add' });
}).add('selected: true', function () {
  return render({ selected: true });
}).add('disabled: true', function () {
  return render({ disabled: true });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _react2.default.createElement(
    _Tab2.default,
    _extends({}, props, { onClick: (0, _storybook.action)('onClick') }),
    'Tab 1'
  );
}