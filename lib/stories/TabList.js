'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _TabList = require('../TabList');

var _TabList2 = _interopRequireDefault(_TabList);

var _Tab = require('../Tab');

var _Tab2 = _interopRequireDefault(_Tab);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('TabList', module).addDecorator(function (story) {
  return _react2.default.createElement(
    'div',
    { style: { textAlign: 'left', margin: '0 100px' } },
    story()
  );
}).add('Default', function () {
  return render();
}).add('defaultSelectedKey: 1', function () {
  return render({ defaultSelectedKey: '1' });
}).add('selectedKey: 1', function () {
  return render({ selectedKey: '1' });
}).add('size: L', function () {
  return render({ size: 'L' });
}).add('orientation: vertical', function () {
  return render({ orientation: 'vertical' });
}).add('orientation: vertical, size: L', function () {
  return render({ orientation: 'vertical', size: 'L' });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _react2.default.createElement(
    _TabList2.default,
    _extends({}, props, { onChange: (0, _storybook.action)('onChange') }),
    _react2.default.createElement(
      _Tab2.default,
      null,
      'Tab 1'
    ),
    _react2.default.createElement(
      _Tab2.default,
      { selected: true },
      'Tab 2'
    )
  );
}