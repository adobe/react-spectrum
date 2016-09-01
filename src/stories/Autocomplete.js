import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Autocomplete from '../Autocomplete';


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

let value = '';
let multipleValues = selectedValue.slice();

storiesOf('Autocomplete', module)
  .addDecorator(story => (
    <VerticalCenter style={ { textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none' } }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({ ...defaultProps }),
    { inline: true }
  )
  .addWithInfo(
    'icon: filter',
    () => render({ icon: 'filter' }),
    { inline: true }
  )
  .addWithInfo(
    'placeholder: other placeholder',
    () => render({ placeholder: 'other placeholder' }),
    { inline: true }
  )
  .addWithInfo(
    'multiple: true',
    () => render({ multiple: true, value: selectedValue }),
    { inline: true }
  )
  .addWithInfo(
    'required: true',
    () => render({ required: true }),
    { inline: true }
  )
  .addWithInfo(
    'invalid: true',
    () => render({ invalid: true }),
    { inline: true }
  )
  .addWithInfo(
    'disabled: true',
    () => render({ disabled: true }),
    { inline: true }
  )
  .addWithInfo(
    'multiple disabled: true',
    () => render({ disabled: true, multiple: true, value: selectedValue }),
    { inline: true }
  )
  .addWithInfo(
    'value: longVal, icon: true',
    () => render({ value: 'logVal', icon: 'filter' }),
    { inline: true }
  )
  .addWithInfo(
    'value: longVal',
    () => render({ value: 'logVal' }),
    { inline: true }
  )
  .addWithInfo(
    'no results',
    () => render({ options: [], noResultsText: 'Nothing to see here folks' }),
    { inline: true }
  )
  .addWithInfo(
    'allowCreate: true',
    () => render({ allowCreate: 'true' }),
  { inline: true }
  )
  .addWithInfo(
    'Stateful component',
    () => render({
      ...defaultProps,
      value,
      onChange: (v) => { value = v; action('change')(v); }
    }),
    { inline: true }
  )
  .addWithInfo(
    'Stateful multiple component',
    () => render({
      ...defaultProps,
      value: multipleValues,
      multiple: true,
      onChange: (v) => { multipleValues = v; action('change')(v); }
    }),
    { inline: true }
  );

function render(props = {}) {
  return (
    <Autocomplete
      label="React"
      onChange={ action('change') }
      onBlur={ action('blur') }
      onClose={ action('close') }
      onFocus={ action('focus') }
      onInputChange={ action('inputChange') }
      onOpen={ action('open') }
      onValueClick={ action('valueClick') }
      { ...defaultProps }
      { ...props }
    />
  );
}
