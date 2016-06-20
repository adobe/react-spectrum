'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Button = require('../Button');

var _Button2 = _interopRequireDefault(_Button);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('Button', module).add('Default', function () {
  return render();
}).add('size: L', function () {
  return render({ size: 'L' });
}).add('block: true', function () {
  return render({ block: true });
}).add('variant: primary', function () {
  return render({ variant: 'primary' });
}).add('variant: secondary', function () {
  return render({ variant: 'secondary' });
}).add('variant: quiet', function () {
  return render({ variant: 'quiet' });
}).add('variant: quiet', function () {
  return render({ variant: 'quiet' });
}).add('variant: warning', function () {
  return render({ variant: 'warning' });
}).add('variant: minimal', function () {
  return render({ variant: 'minimal' });
}).add('icon: bell', function () {
  return render({ icon: 'bell' });
}).add('iconSize: XS', function () {
  return render({ iconSize: 'XS' });
}).add('iconSize: M', function () {
  return render({ iconSize: 'M' });
}).add('iconSize: L', function () {
  return render({ iconSize: 'L' });
}).add('selected: true', function () {
  return render({ selected: true });
}).add('disabled: true', function () {
  return render({ disabled: true });
}).add('element: a', function () {
  return render({ element: 'a' });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _react2.default.createElement(_Button2.default, _extends({
    icon: 'checkCircle',
    label: 'React',
    onClick: (0, _storybook.action)('click')
  }, props));
}