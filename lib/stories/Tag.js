'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Tag = require('../Tag');

var _Tag2 = _interopRequireDefault(_Tag);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('Tag', module).add('Default', function () {
  return render();
}).add('color: blue', function () {
  return render({ color: 'blue' });
}).add('size: M', function () {
  return render({ size: 'M' });
}).add('size: S', function () {
  return render({ size: 'S' });
}).add('quiet: true', function () {
  return render({ quiet: true });
}).add('closable: true', function () {
  return render({ closable: true });
}).add('multiline: true', function () {
  return render({
    children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel vestibulum neque, eu sollicitudin arcu. Etiam sed dolor egestas, rutrum ante quis, aliquam urna. Cras maximus quis ligula a vulputate. Ut non est sagittis, sodales est ac, ullamcorper libero. Aenean quis elementum velit. Nullam eu nulla lectus. Donec sed est nec mi cursus sodales. Aenean imperdiet tristique suscipit. Aenean varius pellentesque mauris. Nunc scelerisque nibh facilisis quam hendrerit eleifend. Phasellus a dolor enim. Etiam ullamcorper euismod nisl quis accumsan. Pellentesque bibendum vulputate interdum. Duis ut mi sapien. Ut vehicula feugiat erat, et posuere nulla facilisis in.',
    multiline: true
  });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var children = arguments.length <= 1 || arguments[1] === undefined ? 'Cool Tag' : arguments[1];

  return _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement(
      _Tag2.default,
      _extends({
        value: 'testValue',
        onClose: (0, _storybook.action)('close')
      }, props),
      props.children || children
    )
  );
}