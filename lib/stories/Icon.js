'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Icon = require('../Icon');

var _Icon2 = _interopRequireDefault(_Icon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('Icon', module).add('Default', function () {
  return render();
}).add('icon: bell', function () {
  return render({ icon: 'bell' });
}).add('icon: twitterColor', function () {
  return render({ icon: 'twitterColor' });
}).add('size: XS', function () {
  return render({ size: 'XS' });
}).add('size: S', function () {
  return render({ size: 'S' });
}).add('size: L', function () {
  return render({ size: 'L' });
}).add('size: XL', function () {
  return render({ size: 'XL' });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _react2.default.createElement(_Icon2.default, _extends({ icon: 'add' }, props));
}