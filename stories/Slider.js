import {action, storiesOf} from '@storybook/react';
import FieldLabel from '../src/FieldLabel';
import React from 'react';
import Slider from '../src/Slider';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Slider', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({label: 'Default'}),
    {inline: true}
  )
  .addWithInfo(
    'Min = 10, max = 20, Step = 1',
    () => render({min: 10, max: 20, step: 1, label: 'Min = 10, max = 20, Step = 1'}),
    {inline: true}
  )
  .addWithInfo(
    'Default value',
    () => render({defaultValue: 75, label: 'Default value'}),
    {inline: true}
  )
  .addWithInfo(
    'Controlled value',
    () => render({value: 75, label: 'Controlled value'}),
    {inline: true}
  )
  /* Spectrum-css has not implemented vertical variant
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
  */
  .addWithInfo(
    'renderLabel: true',
    () => render({renderLabel: true, label: 'Rendered Label'}),
    {inline: true}
  )
  .addWithInfo(
    'filled',
    () => render({filled: true, renderLabel: true, label: 'filled'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: ramp',
    () => render({variant: 'ramp', renderLabel: true, label: 'variant: ramp'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: range',
    () => render({variant: 'range', renderLabel: true, label: 'variant: range'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: range Default values',
    () => render({variant: 'range', defaultStartValue: 20, defaultEndValue: 60, renderLabel: true, label: 'variant: range Default values'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: range Controlled values',
    () => render({variant: 'range', startValue: 45, endValue: 75, renderLabel: true, label: 'variant: range Controlled values'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: range Min = 10, max = 20, Step = 1',
    () => render({variant: 'range', min: 10, max: 20, step: 1, renderLabel: true, label: 'variant: range Min = 10, max = 20, Step = 1'}),
    {inline: true}
  )
  .addWithInfo(
    'disabled',
    () => render({disabled: true}),
    {inline: true}
  )
  .addWithInfo(
    'variant: range disabled',
    () => render({disabled: true, variant: 'range', filled: true, renderLabel: true, label: 'variant: range disabled'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: range with aria-label',
    () => render({variant: 'range', filled: true, renderLabel: true, 'aria-label': 'variant: range with aria-label'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: range with aria-labelledby',
    () => (
      <div>
        <FieldLabel label="variant: range with aria-labelledby" labelFor="foo" id="bar" />
        {render({variant: 'range', filled: true, id: 'foo', 'aria-labelledby': 'bar', 'aria-label': 'variant: range with aria-label'})}
      </div>
    ),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Slider
      onChange={action('change')}
      {...props} />
  );
}
