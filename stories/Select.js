import {action, storiesOf} from '@storybook/react';
import React from 'react';
import Select from '../src/Select';
import {VerticalCenter} from '../.storybook/layout';
import {withKnobs} from '@storybook/addon-knobs';

const defaultList = {
  options: [
    {label: 'Chocolate', value: 'chocolate'},
    {label: 'Vanilla', value: 'vanilla'},
    {label: 'Strawberry', value: 'strawberry'},
    {label: 'Caramel', value: 'caramel'},
    {label: 'Cookies and Cream', value: 'cookiescream'},
    {label: 'Peppermint', value: 'peppermint'}
  ]
};

const longList = {
  options: [
    ...defaultList.options,
    {label: 'Crispity, crunchity, peanut-buttery munchity', value: 'butterfinger'}
  ]
};

const defaultProps = {
  selectedValue: ['Peppermint']
};

const tinyList = {
  options: [
    {label: 'AM', value: 'am'},
    {label: 'PM', value: 'PM'}
  ]
};

const tinyProps = {
  selectedValue: ['am']
};

const selectedValue = [
  'chocolate',
  'vanilla'
];

storiesOf('Select', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addDecorator(withKnobs)
  .addWithInfo(
    'Default',
    () => render({...defaultProps}),
    {inline: true}
  )
  .addWithInfo(
    'Various widths',
    () => renderMany(),
    {inline: true}
  )
  .addWithInfo(
    'placeholder: other placeholder',
    () => render({placeholder: 'other placeholder'}),
    {inline: true}
  )
  .addWithInfo(
    'flexible',
    () => render({flexible: true}),
    {inline: true}
  )
  .addWithInfo(
    'quiet',
    () => render({quiet: true}),
    {inline: true}
  )
  .addWithInfo(
    'quiet flexible',
    () => render({quiet: true, flexible: true}),
    {inline: true}
  )
  .addWithInfo(
    'quiet, value: longVal',
    () => render({quiet: true, flexible: true, selectedValue: 'butterfinger'}),
    {inline: true}
  )
  .addWithInfo(
    'quiet multiple',
    () => render({quiet: true, flexible: true, multiple: true, value: selectedValue}),
    {inline: true}
  )
  .addWithInfo(
    'quiet disabled',
    () => render({quiet: true, flexible: true, disabled: true}),
    {inline: true}
  )
  .addWithInfo(
    'multiple: true',
    () => render({multiple: true, flexible: true, defaultValue: selectedValue}),
    {inline: true}
  )
  .addWithInfo(
    'required: true',
    () => render({required: true}),
    {inline: true}
  )
  .addWithInfo(
    'disabled: true',
    () => render({disabled: true}),
    {inline: true}
  )
  .addWithInfo(
    'invalid: true',
    () => render({invalid: true}),
    {inline: true}
  )
  .addWithInfo(
    'multiple disabled: true',
    () => render({disabled: true, multiple: true, value: selectedValue}),
    {inline: true}
  )
  .addWithInfo(
    'value: longVal',
    () => render({value: 'logVal'}),
    {inline: true}
  )
  .addWithInfo(
    'Stay open on select',
    () => render({closeOnSelect: false}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Select
      onChange={action('change')}
      onOpen={action('open')}
      onClose={action('close')}
      {...defaultList}
      {...defaultProps}
      {...props} />
  );
}

function renderMany(props = {}) {
  return (
    <div>
      <p>A. Default width:</p>
      <Select
        onChange={action('change')}
        onOpen={action('open')}
        onClose={action('close')}
        {...longList}
        {...defaultProps} />
      <p>B. Fixed width:</p>
      <Select
        style={{width: '72px'}}
        onChange={action('change')}
        onOpen={action('open')}
        onClose={action('close')}
        {...tinyList}
        {...tinyProps} />
      <p>B. 100% of container</p>
      <Select
        style={{width: '100%'}}
        onChange={action('change')}
        onOpen={action('open')}
        onClose={action('close')}
        {...longList}
        {...defaultProps} />
    </div>
  );
}
