'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _RadioGroup = require('../RadioGroup');

var _RadioGroup2 = _interopRequireDefault(_RadioGroup);

var _Radio = require('../Radio');

var _Radio2 = _interopRequireDefault(_Radio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('RadioGroup', module).add('Default', function () {
  return render();
}).add('labelsBelow: true', function () {
  return render({ labelsBelow: true });
}).add('vertical: true', function () {
  return render({ vertical: true });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _react2.default.createElement(
    _RadioGroup2.default,
    _extends({ name: 'foo-group', onChange: (0, _storybook.action)('change') }, props),
    _react2.default.createElement(_Radio2.default, { label: '1', value: '1' }),
    _react2.default.createElement(_Radio2.default, { label: '2', value: '2' }),
    _react2.default.createElement(_Radio2.default, { label: '3', value: '3' })
  );
}