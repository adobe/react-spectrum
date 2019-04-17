import {action} from '@storybook/addon-actions';
import Radio from '../src/Radio';
import RadioGroup from '../src/RadioGroup';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('RadioGroup', module)
  .add(
    'Default',
    () => render(),
    {info: 'Remember to import Radio before RadioGroup'}
  )
  .add(
    'labelsBelow: true',
    () => render({labelsBelow: true}),
    {info: 'Remember to import Radio before RadioGroup'}
  )
  .add(
    'vertical: true',
    () => render({vertical: true}),
    {info: 'Remember to import Radio before RadioGroup'}
  )
  .add(
    'defaultSelectedValue',
    () => render({defaultSelectedValue: '2'}),
    {info: 'Remember to import Radio before RadioGroup'}
  );

function render(props = {}) {
  return (
    <RadioGroup name="foo-group" onChange={action('change')} {...props}>
      <Radio label="1" value="1" />
      <Radio label="2" value="2" />
      <Radio label="3" value="3" />
    </RadioGroup>
  );
}
