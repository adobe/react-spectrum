'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Autocomplete = require('../Autocomplete');

var _Autocomplete2 = _interopRequireDefault(_Autocomplete);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultProps = {
  placeholder: 'Enter Text...',
  options: [{ label: 'Chocolate', value: 'chocolate' }, { label: 'Vanilla', value: 'vanilla' }, { label: 'Strawberry', value: 'strawberry' }, { label: 'Caramel', value: 'caramel' }, { label: 'Cookies and Cream', value: 'cookiescream' }, { label: 'Peppermint', value: 'peppermint' }, { label: 'Some crazy long value that should be cut off', value: 'logVal' }]
};

var selectedValue = ['chocolate', 'vanilla', 'logVal'];

(0, _storybook.storiesOf)('Autocomplete', module).add('Default', function () {
  return render(_extends({}, defaultProps));
}).add('icon: filter', function () {
  return render({ icon: 'filter' });
}).add('placeholder: other placeholder', function () {
  return render({ placeholder: 'other placeholder' });
}).add('multiple: true', function () {
  return render({ multiple: true, value: selectedValue });
}).add('required: true', function () {
  return render({ required: true });
}).add('invalid: true', function () {
  return render({ invalid: true });
}).add('disabled: true', function () {
  return render({ disabled: true });
}).add('multiple disabled: true', function () {
  return render({ disabled: true, multiple: true, value: selectedValue });
}).add('value: longVal, icon: true', function () {
  return render({ value: 'logVal', icon: 'filter' });
}).add('value: longVal', function () {
  return render({ value: 'logVal' });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _react2.default.createElement(_Autocomplete2.default, _extends({
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