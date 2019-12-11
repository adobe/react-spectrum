import {number, withKnobs} from '@storybook/addon-knobs';
import {ProgressCircle} from '../';
import React, {CSSProperties} from 'react';
import {storiesOf} from '@storybook/react';

const sliderOptions = {
  range: true,
  min: 0,
  max: 100,
  step: 1
};

const centeredBoxStyle: CSSProperties = {
  width: '100px',
  height: '100px',
  position: 'relative',
  borderColor: 'black',
  borderStyle: 'solid'
};

const grayedBoxStyle: CSSProperties = {
  width: '100px',
  height: '100px',
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

storiesOf('Progress/ProgressCircle', module)
  .addDecorator(withKnobs)
  .add(
    'Default',
    () => render()
  )
  .add(
    'value: 50',
    () => {
      const value = number('Value', 50, sliderOptions);
      return render({value});
    }
  )
  .add(
    'value: 100',
    () => {
      const value = number('Value', 100, sliderOptions);
      return render({value});
    }
  )
  .add(
    'size: S',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({value, size: 'S'});
    }
  )
  .add(
    'size: L',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({value, size: 'L'});
    }
  )
  .add(
    'variant: overBackground',
    () =>  {
      const value = number('Value', 32, sliderOptions);
      return (
        <div style={grayedBoxStyle}>
          {render({value, variant: 'overBackground'})}
        </div>
      );
    }
  )
  .add(
    'isCentered: true',
    () =>  {
      const value = number('Value', 32, sliderOptions);
      return (
        <div style={centeredBoxStyle}>
          {render({value, isCentered: true})}
        </div>
      );
    }
  )
  .add(
    'Using raw values for minValue, maxValue, and value',
    () => render({
      labelPosition: 'top',
      maxValue: 2147483648,
      value: 715827883
    })
  )
  .add(
    'isIndeterminate: true',
    () => render({isIndeterminate: true})
  )
  .add(
    'isIndeterminate: true, size: S',
    () => render({isIndeterminate: true, size: 'S'})
  )
  .add(
    'isIndeterminate: true, size: L',
    () => render({isIndeterminate: true, size: 'L'})
  )
  .add(
    'isIndeterminate: true, variant: overBackground',
    () => (
      <div style={grayedBoxStyle}>
        {render({isIndeterminate: true, variant: 'overBackground'})}
      </div>
    )
  )
  .add(
    'isIndeterminate: true, isCentered: true',
    () => (
      <div style={centeredBoxStyle}>
        {render({isIndeterminate: true, isCentered: true})}
      </div>
    )
  );

function render(props = {}) {
  return (
    <ProgressCircle aria-label="Loading…" {...props} />
  );
}
