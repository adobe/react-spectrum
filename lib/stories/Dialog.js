'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Button = require('../Button');

var _Button2 = _interopRequireDefault(_Button);

var _Dialog = require('../Dialog');

var _Dialog2 = _interopRequireDefault(_Dialog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var title = _react2.default.createElement(
  _Dialog2.default.Header,
  null,
  'Title'
);
var content = _react2.default.createElement(
  _Dialog2.default.Content,
  null,
  'Content'
);
var dialogChildren = [title, content];
(0, _storybook.storiesOf)('Dialog', module).add('Default', function () {
  return render(dialogChildren);
}).add('Long content', function () {
  return render(longMarkup);
}).add('open: false', function () {
  return render(dialogChildren, { open: false });
}).add('closable: false', function () {
  return render(dialogChildren, { closable: false });
}).add('variant: error', function () {
  return render(dialogChildren, { variant: 'error' });
}).add('variant: warning', function () {
  return render(dialogChildren, { variant: 'warning' });
}).add('variant: success', function () {
  return render(dialogChildren, { variant: 'success' });
}).add('variant: help', function () {
  return render(dialogChildren, { variant: 'help' });
}).add('variant: info', function () {
  return render(dialogChildren, { variant: 'info' });
}).add('backdrop: none', function () {
  return render(dialogChildren, { backdrop: 'none' });
}).add('backdrop: static', function () {
  return render(dialogChildren, { backdrop: 'static' });
});

function render(children) {
  var props = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return _react2.default.createElement(
    _Dialog2.default,
    _extends({
      open: true,
      closable: true,
      onClose: (0, _storybook.action)('close'),
      footer: ''
    }, props),
    children
  );
}

var longMarkup = [
// building an array of children like this will cause react to complain about needing a key
// since this is not how you will generally build a Dialog this should be fine
_react2.default.createElement(
  _Dialog2.default.Header,
  null,
  'Really long content...'
), _react2.default.createElement(
  _Dialog2.default.Content,
  null,
  _react2.default.createElement(
    'p',
    null,
    'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus'
  ),
  _react2.default.createElement(
    'p',
    null,
    'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus'
  ),
  _react2.default.createElement(
    'p',
    null,
    'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus'
  )
), _react2.default.createElement(
  _Dialog2.default.Footer,
  null,
  _react2.default.createElement(_Button2.default, { variant: 'primary', label: 'Custom Button', 'close-dialog': true, onClick: (0, _storybook.action)('custom-close-button') })
)];