'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Progress = require('../Progress');

var _Progress2 = _interopRequireDefault(_Progress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('Progress', module).add('Default', function () {
  return render();
}).add('value: 50', function () {
  return render({ value: 50 });
}).add('value: 100', function () {
  return render({ value: 100 });
}).add('indeterminate: true', function () {
  return render({ indeterminate: true, value: 50 });
}).add('size: S', function () {
  return render({ size: 'S', value: 50 });
}).add('size: L', function () {
  return render({ size: 'L', value: 50 });
}).add('showLabel: true', function () {
  return render({ showLabel: true, value: 50 });
}).add('labelPosition: left', function () {
  return render({ showLabel: true, labelPosition: 'left', value: 50 });
}).add('labelPosition: bottom', function () {
  return render({ showLabel: true, labelPosition: 'bottom', value: 50 });
}).add('label: React', function () {
  return render({ showLabel: true, label: 'React', value: 50 });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _react2.default.createElement(_Progress2.default, props);
}