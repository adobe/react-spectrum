'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Accordion = require('../Accordion');

var _Accordion2 = _interopRequireDefault(_Accordion);

var _AccordionItem = require('../AccordionItem');

var _AccordionItem2 = _interopRequireDefault(_AccordionItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('Accordion', module).addDecorator(function (story) {
  return _react2.default.createElement(
    'div',
    { style: { textAlign: 'left', margin: '0 100px' } },
    story()
  );
}).add('Default', function () {
  return render();
}).add('multiselectable: true', function () {
  return render({ multiselectable: true });
}).add('defaultSelectedKey: 1', function () {
  return render({ defaultSelectedKey: '1' });
}).add('selectedKey: 1', function () {
  return render({ selectedKey: '1' });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _react2.default.createElement(
    _Accordion2.default,
    _extends({}, props, { onChange: (0, _storybook.action)('onChange') }),
    _react2.default.createElement(
      _AccordionItem2.default,
      { header: 'Header 1' },
      'Item 1'
    ),
    _react2.default.createElement(
      _AccordionItem2.default,
      { header: 'Header 2' },
      'Item 2'
    )
  );
}