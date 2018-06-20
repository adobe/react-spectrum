import {number, withKnobs} from '@storybook/addon-knobs';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

import Wait from '../src/Wait';

const sliderOptions = {
  range: true,
  min: 0,
  max: 100,
  step: 1,
};

storiesOf('Wait', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addDecorator(withKnobs)
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'size: S',
    () => render({size: 'S'}),
    {inline: true}
  )
  .addWithInfo(
    'size: L',
    () => render({size: 'L'}),
    {inline: true}
  )
  .addWithInfo(
    'centered: true',
    () => render({centered: true}),
    {inline: true}
  )
  .addWithInfo(
    'variant: determinate',
    'Adjust the slider in the knobs tab below to change the value',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({variant: 'determinate', value});
    },
    {inline: true},
  )
  .addWithInfo(
    'variant: determinate, size: S',
    'Adjust the slider in the knobs tab below to change the value',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({variant: 'determinate', size: 'S', value});
    },
    {inline: true}
  )
  .addWithInfo(
    'variant: determinate, size: L',
    'Adjust the slider in the knobs tab below to change the value',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({variant: 'determinate', size: 'L', value});
    },
    {inline: true}
  )
  .addWithInfo(
    'variant: determinate, centered: true',
    'Adjust the slider in the knobs tab below to change the value',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({variant: 'determinate', centered: true, value});
    },
    {inline: true}
  );

function render(props = {}) {
  return (
    <Wait {...props} />
  );
}
