'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _SelectList = require('../SelectList');

var _SelectList2 = _interopRequireDefault(_SelectList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultProps = {
  placeholder: 'Enter Text...',
  options: [{ label: 'Chocolate', value: 'chocolate' }, { label: 'Vanilla', value: 'vanilla' }, { label: 'Strawberry', value: 'strawberry' }, { label: 'Caramel', value: 'caramel' }, { label: 'Cookies and Cream', value: 'cookiescream', disabled: true }, { label: 'Peppermint', value: 'peppermint' }, { label: 'Some crazy long value that should be cut off', value: 'logVal' }]
};

var groupedOptions = {
  'Group 1': [{ label: 'Chocolate', value: 'chocolate' }, { label: 'Vanilla', value: 'vanilla' }, { label: 'Strawberry', value: 'strawberry' }],
  'Group 2': [{ label: 'Caramel', value: 'caramel' }, { label: 'Cookies and Cream', value: 'cookiescream', disabled: true }, { label: 'Peppermint', value: 'peppermint' }],
  'Group 3': [{ label: 'Some crazy long value that should be cut off', value: 'logVal' }]
};

var selectedValue = ['chocolate', 'vanilla', 'logVal'];

(0, _storybook.storiesOf)('SelectList', module).add('Default', function () {
  return render(_extends({}, defaultProps));
}).add('grouped: true', function () {
  return render({ options: groupedOptions });
}).add('grouped multiple: true', function () {
  return render({ multiple: true, value: selectedValue, options: groupedOptions });
}).add('multiple noValue: true', function () {
  return render({ multiple: true });
}).add('multiple: true', function () {
  return render({ multiple: true, value: selectedValue });
}).add('multiple disabled: true', function () {
  return render({ disabled: true, multiple: true, value: selectedValue });
}).add('disabled: true', function () {
  return render({ disabled: true });
}).add('value: longVal', function () {
  return render({ value: 'logVal' });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _react2.default.createElement(_SelectList2.default, _extends({
    style: { textAlign: 'left' },
    label: 'React',
    onChange: (0, _storybook.action)('change'),
    onBlur: (0, _storybook.action)('blur'),
    onClose: (0, _storybook.action)('close'),
    onFocus: (0, _storybook.action)('focus'),
    onInputChange: (0, _storybook.action)('inputChange'),
    onOpen: (0, _storybook.action)('open'),
    onValueClick: (0, _storybook.action)('valueClick')
  }, defaultProps, props));
}