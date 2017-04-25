import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import Slider from '../src/Slider';

storiesOf('Slider', module)
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
    'Min = 10, max = 20, Step = 1',
    () => render({min: 10, max: 20, step: 1}),
    {inline: true}
  )
  .addWithInfo(
    'Default value',
    () => render({defaultValue: 0.75}),
    {inline: true}
  )
  .addWithInfo(
    'Controlled value',
    () => render({value: 0.75}),
    {inline: true}
  )
  .addWithInfo(
    'Vertical',
    () => render({orientation: 'vertical'}),
    {inline: true}
  )
  .addWithInfo(
    'Vertical step = 1',
    () => render({orientation: 'vertical', min: 0, max: 10, step: 1}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Slider
      { ...props }
    />
  );
}
