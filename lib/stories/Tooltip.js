'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Tooltip = require('../Tooltip');

var _Tooltip2 = _interopRequireDefault(_Tooltip);

var _Button = require('../Button');

var _Button2 = _interopRequireDefault(_Button);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('Tooltip', module).add('Default', function () {
  return render('This is a tooltip.');
}).add('Long content', function () {
  return render(longMarkup);
}).add('placement: left', function () {
  return render('This is a tooltip.', { placement: 'left' });
}).add('placement: top', function () {
  return render('This is a tooltip.', { placement: 'top' });
}).add('placement: bottom', function () {
  return render('This is a tooltip.', { placement: 'bottom' });
}).add('variant: error', function () {
  return render('This is a tooltip.', { variant: 'error' });
}).add('variant: success', function () {
  return render('This is a tooltip.', { variant: 'success' });
}).add('variant: info', function () {
  return render('This is a tooltip.', { variant: 'info' });
}).add('openOn: hover', function () {
  return render('This is a tooltip.', { openOn: 'hover' });
}).add('openOn: click', function () {
  return render('This is a tooltip.', { openOn: 'click' });
});

function render(children) {
  var props = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var buttonLbl = 'Target';
  if (props.openOn === 'hover') {
    buttonLbl = 'Hover Over Me';
  }
  if (props.openOn === 'click') {
    buttonLbl = 'Click Me';
  }
  return _react2.default.createElement(
    'div',
    { style: { display: 'inline-block' } },
    _react2.default.createElement(
      _Tooltip2.default,
      _extends({
        title: 'Title',
        openOn: 'always',
        open: true,
        closable: true,
        content: children,
        onClose: (0, _storybook.action)('close')
      }, props),
      _react2.default.createElement(_Button2.default, { label: buttonLbl })
    )
  );
}

var longMarkup = _react2.default.createElement(
  'div',
  null,
  'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui.'
);