'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Popover = require('../Popover');

var _Popover2 = _interopRequireDefault(_Popover);

var _Button = require('../Button');

var _Button2 = _interopRequireDefault(_Button);

var _Heading = require('../Heading');

var _Heading2 = _interopRequireDefault(_Heading);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('Popover', module).add('Default', function () {
  return render('Content');
}).add('Long content', function () {
  return render(longMarkup);
}).add('placement: left', function () {
  return render('Content', { placement: 'left' });
}).add('placement: top', function () {
  return render('Content', { placement: 'top' });
}).add('placement: bottom', function () {
  return render('Content', { placement: 'bottom' });
}).add('open: false', function () {
  return render('Content', { open: false });
}).add('closable: false', function () {
  return render('Content', { closable: false });
}).add('variant: error', function () {
  return render('Content', { variant: 'error' });
}).add('variant: warning', function () {
  return render('Content', { variant: 'warning' });
}).add('variant: success', function () {
  return render('Content', { variant: 'success' });
}).add('variant: help', function () {
  return render('Content', { variant: 'help' });
}).add('variant: info', function () {
  return render('Content', { variant: 'info' });
});

function render(children) {
  var props = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return _react2.default.createElement(
    'div',
    { style: { display: 'inline-block' } },
    _react2.default.createElement(
      _Popover2.default,
      _extends({
        title: 'Title',
        open: true,
        closable: true,
        content: children,
        onClose: (0, _storybook.action)('close')
      }, props),
      _react2.default.createElement(_Button2.default, { label: 'Click Me' })
    )
  );
}

var longMarkup = _react2.default.createElement(
  'div',
  null,
  _react2.default.createElement(
    _Heading2.default,
    { size: 2 },
    'Really long content...'
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
  ),
  _react2.default.createElement(
    'p',
    null,
    'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus'
  )
);