import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import SelectList from '../src/SelectList';

const defaultProps = {
  placeholder: 'Enter Text...',
  options: [
    {label: 'Chocolate', value: 'chocolate'},
    {label: 'Vanilla', value: 'vanilla'},
    {label: 'Strawberry', value: 'strawberry'},
    {label: 'Caramel', value: 'caramel'},
    {label: 'Cookies and Cream', value: 'cookiescream', disabled: true},
    {label: 'Peppermint', value: 'peppermint'},
    {label: 'Some crazy long value that should be cut off', value: 'logVal'}
  ]
};

const groupedOptions = {
  'Group 1': [
    {label: 'Chocolate', value: 'chocolate'},
    {label: 'Vanilla', value: 'vanilla'},
    {label: 'Strawberry', value: 'strawberry'}
  ],
  'Group 2': [
    {label: 'Caramel', value: 'caramel'},
    {label: 'Cookies and Cream', value: 'cookiescream', disabled: true},
    {label: 'Peppermint', value: 'peppermint'}
  ],
  'Group 3': [
    {label: 'Some crazy long value that should be cut off', value: 'logVal'}
  ]
};

const selectedValue = [
  'chocolate',
  'vanilla',
  'logVal'
];


storiesOf('SelectList', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (render({...defaultProps})),
    {inline: true}
  )
  .addWithInfo(
    'grouped: true',
    () => (render({options: groupedOptions})),
    {inline: true}
  )
  .addWithInfo(
    'grouped multiple: true',
    () => (render({multiple: true, value: selectedValue, options: groupedOptions})),
    {inline: true}
  )
  .addWithInfo(
    'multiple noValue: true',
    () => (render({multiple: true})),
    {inline: true}
  )
  .addWithInfo(
    'multiple: true',
    () => (render({multiple: true, value: selectedValue})),
    {inline: true}
  )
  .addWithInfo(
    'multiple disabled: true',
    () => (render({disabled: true, multiple: true, value: selectedValue})),
    {inline: true}
  )
  .addWithInfo(
    'disabled: true',
    () => (render({disabled: true})),
    {inline: true}
  )
  .addWithInfo(
    'value: longVal',
    () => (render({value: 'logVal'})),
    {inline: true}
  );

function render(props = {}) {
  return (
    <SelectList
      style={{textAlign: 'left'}}
      label="React"
      onChange={action('change')}
      {...defaultProps}
      {...props}
    />
  );
}
