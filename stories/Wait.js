import {number, withKnobs} from '@storybook/addon-knobs';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

import Wait from '../src/Wait';

const sliderOptions = {
  range: true,
  min: 0,
  max: 100,
  step: 1
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
    'variant: overBackground',
    () => {
      const style = {
        'width': '100px',
        'height': '100px',
        'background-color': 'rgba(0,0,0,0.4)',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center'
      };

      return (
        <div style={style}>
          {render({variant: 'overBackground'})}
        </div>
      );
    },
    {inline: true}
  )
  .addWithInfo(
    'centered: true',
    () => render({centered: true}),
    {inline: true}
  )
  .addWithInfo(
    'indeterminate: false',
    'Adjust the slider in the knobs tab below to change the value',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({indeterminate: false, value});
    },
    {inline: true},
  )
  .addWithInfo(
    'indeterminate: false, size: S',
    'Adjust the slider in the knobs tab below to change the value',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({indeterminate: false, size: 'S', value});
    },
    {inline: true}
  )
  .addWithInfo(
    'indeterminate: false, size: L',
    'Adjust the slider in the knobs tab below to change the value',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({indeterminate: false, size: 'L', value});
    },
    {inline: true}
  )
  .addWithInfo(
    'indeterminate: false, variant: overBackground',
    'Adjust the slider in the knobs tab below to change the value',
    () => {
      const value = number('Value', 32, sliderOptions);
      const style = {
        'width': '100px',
        'height': '100px',
        'background-color': 'rgba(0,0,0,0.4)',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center'
      };

      return (
        <div style={style}>
          {render({indeterminate: false, variant: 'overBackground', value})}
        </div>
      );
    },
    {inline: true}
  )
  .addWithInfo(
    'indeterminate: false, centered: true',
    'Adjust the slider in the knobs tab below to change the value',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({indeterminate: false, centered: true, value});
    },
    {inline: true}
  );

function render(props = {}) {
  return (
    <Wait {...props} />
  );
}
