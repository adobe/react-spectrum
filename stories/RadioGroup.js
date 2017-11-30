import {action, storiesOf} from '@storybook/react';
import Radio from '../src/Radio';
import RadioGroup from '../src/RadioGroup';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('RadioGroup', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'labelsBelow: true',
    () => render({labelsBelow: true}),
    {inline: true}
  )
  .addWithInfo(
    'vertical: true',
    () => render({vertical: true}),
    {inline: true}
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
