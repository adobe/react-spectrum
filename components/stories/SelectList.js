import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import SelectList from '../SelectList';


const defaultProps = {
  placeholder: 'Enter Text...',
  options: [
    { label: 'Chocolate', value: 'chocolate' },
    { label: 'Vanilla', value: 'vanilla' },
    { label: 'Strawberry', value: 'strawberry' },
    { label: 'Caramel', value: 'caramel' },
    { label: 'Cookies and Cream', value: 'cookiescream', disabled: true },
    { label: 'Peppermint', value: 'peppermint' },
    { label: 'Some crazy long value that should be cut off', value: 'logVal' }
  ]
};

const groupedOptions = {
  'Group 1': [
    { label: 'Chocolate', value: 'chocolate' },
    { label: 'Vanilla', value: 'vanilla' },
    { label: 'Strawberry', value: 'strawberry' }
  ],
  'Group 2': [
    { label: 'Caramel', value: 'caramel' },
    { label: 'Cookies and Cream', value: 'cookiescream', disabled: true },
    { label: 'Peppermint', value: 'peppermint' }
  ],
  'Group 3': [
    { label: 'Some crazy long value that should be cut off', value: 'logVal' }
  ]
};

const selectedValue = [
  'chocolate',
  'vanilla',
  'logVal'
];


storiesOf('SelectList', module)
  .add('Default', () => (render({ ...defaultProps })))
  .add('grouped: true', () => (render({ options: groupedOptions })))
  .add('grouped multiple: true', () => (render({ multiple: true, value: selectedValue, options: groupedOptions })))
  .add('multiple noValue: true', () => (render({ multiple: true })))
  .add('multiple: true', () => (render({ multiple: true, value: selectedValue })))
  .add('multiple disabled: true', () => (render({ disabled: true, multiple: true, value: selectedValue })))
  .add('disabled: true', () => (render({ disabled: true })))
  .add('value: longVal', () => (render({ value: 'logVal' })));

function render(props = {}) {
  return (
    <SelectList
      style={ { textAlign: 'left' } }
      label="React"
      onChange={ action('change') }
      onBlur={ action('blur') }
      onClose={ action('close') }
      onFocus={ action('focus') }
      onInputChange={ action('inputChange') }
      onOpen={ action('open') }
      onValueClick={ action('valueClick') }
      { ...defaultProps}
      { ...props }
    />
  );
}
