import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import Select from '../Select';


const defaultProps = {
  placeholder: 'Enter Text...',
  options: [
    { label: 'Chocolate', value: 'chocolate' },
    { label: 'Vanilla', value: 'vanilla' },
    { label: 'Strawberry', value: 'strawberry' },
    { label: 'Caramel', value: 'caramel' },
    { label: 'Cookies and Cream', value: 'cookiescream' },
    { label: 'Peppermint', value: 'peppermint' },
    { label: 'Some crazy long value that should be cut off', value: 'logVal' }
  ]
};

const selectedValue = [
  'chocolate',
  'vanilla',
  'logVal'
];


storiesOf('Select', module)
  .add('Default', () => (render({ ...defaultProps })))
  .add('placeholder: other placeholder', () => (render({ placeholder: 'other placeholder' })))
  .add('variant: quiet', () => (render({ variant: 'quiet' })))
  .add('variant: quiet value: longVal', () => (render({ variant: 'quiet', value: 'logVal' })))
  .add('variant: quiet multiple', () => (render({ variant: 'quiet', multiple: true, value: selectedValue })))
  .add('multiple: true', () => (render({ multiple: true, value: selectedValue })))
  .add('required: true', () => (render({ required: true })))
  .add('read-only: true', () => (render({ readOnly: true })))
  .add('disabled: true', () => (render({ disabled: true })))
  .add('invalid: true', () => (render({ invalid: true })))
  .add('multiple disabled: true', () => (render({ disabled: true, multiple: true, value: selectedValue })))
  .add('value: longVal', () => (render({ value: 'logVal' })));

function render(props = {}) {
  return (
    <Select
      label="React"
      onChange={action('change')}
      onBlur={action('blur')}
      onClose={action('close')}
      onFocus={action('focus')}
      onInputChange={action('inputChange')}
      onOpen={action('open')}
      onValueClick={action('valueClick')}
      { ...defaultProps}
      { ...props }
    />
  );
}
