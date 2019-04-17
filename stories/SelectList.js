import {action} from '@storybook/addon-actions';
import React from 'react';
import SelectList from '../src/SelectList';
import {storiesOf} from '@storybook/react';

const defaultProps = {
  placeholder: 'Enter Text...',
  options: [
    {label: 'Chocolate', value: 'chocolate'},
    {label: 'Vanilla', value: 'vanilla'},
    {label: 'Strawberry', value: 'strawberry'},
    {label: 'Caramel', value: 'caramel'},
    {label: 'Cookies and Cream', value: 'cookiescream', disabled: true},
    {label: 'Peppermint', value: 'peppermint'},
    {label: 'Some crazy long value that should be cut off', value: 'longVal'}
  ]
};

const selectedValue = [
  'chocolate',
  'vanilla',
  'longVal'
];

storiesOf('SelectList', module)
  .add(
    'Default',
    () => (render({...defaultProps}))
  )
  .add(
    'multiple noValue: true',
    () => (render({multiple: true}))
  )
  .add(
    'multiple: true',
    () => (render({multiple: true, value: selectedValue}))
  )
  .add(
    'multiple disabled: true',
    () => (render({disabled: true, multiple: true, value: selectedValue}))
  )
  .add(
    'disabled: true',
    () => (render({disabled: true}))
  )
  .add(
    'value: longVal',
    () => (render({value: 'longVal'}))
  )
  .add(
    'renderItem',
    () => render({
      multiple: true,
      renderItem: item => <em>{item.label}</em>
    }),
    {info: 'This example uses renderItem method to italicize text when item is selected'}
  );

function render(props = {}) {
  return (
    <SelectList
      style={{textAlign: 'left', maxWidth: '192px'}}
      label="React"
      onChange={action('change')}
      {...defaultProps}
      {...props} />
  );
}
