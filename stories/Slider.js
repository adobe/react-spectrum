import React from 'react';
import Slider from '../src/Slider';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Slider', module)
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
  )
  .addWithInfo(
    'variant:range',
    () => render({variant: 'range'}),
    {inline: true}
  )
  .addWithInfo(
    'variant:range Default values',
    () => render({variant: 'range', defaultStartValue: 0.2, defaultEndValue: 0.6}),
    {inline: true}
  )
  .addWithInfo(
    'variant:range Controlled values',
    () => render({variant: 'range', startValue: 0.45, endValue: 0.75}),
    {inline: true}
  )
  .addWithInfo(
    'variant:range Min = 10, max = 20, Step = 1',
    () => render({variant: 'range', min: 10, max: 20, step: 1}),
    {inline: true}
  )
  .addWithInfo(
    'disabled',
    () => render({disabled: true}),
    {inline: true}
  )
   .addWithInfo(
    'variant:range disabled',
    () => render({disabled: true, variant: 'range'}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Slider
      {...props} />
  );
}
