import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import RadioGroup from '../src/RadioGroup';
import Radio from '../src/Radio';

storiesOf('RadioGroup', module)
  .addDecorator(story => (
    <VerticalCenter style={ {textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'} }>
      { story() }
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
    <RadioGroup name="foo-group" onChange={ action('change') } { ...props }>
      <Radio label="1" value="1" />
      <Radio label="2" value="2" />
      <Radio label="3" value="3" />
    </RadioGroup>
  );
}
