import {number, withKnobs} from '@storybook/addon-knobs';
import {ProgressCircle} from '../src';
import {ProgressCircleProps} from '@react-types/progress';
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
    'size: S',
    () => render({size: 'S'})
  )
  .add(
    'size: L',
    () => render({size: 'L'})
  )
  .add(
    'variant: overBackground',
    () => (
      <div style={grayedBoxStyle}>
        {render({variant: 'overBackground'})}
      </div>
    )
  )
  .add(
    'isCentered: true',
    () => (
      <div style={centeredBoxStyle}>
        {render({isCentered: true})}
      </div>
    )
  )
  .add(
    'isIndeterminate: false',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({isIndeterminate: false, value});
    }
  )
  .add(
    'isIndeterminate: false, size: S',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({isIndeterminate: false, size: 'S', value});
    }
  )
  .add(
    'isIndeterminate: false, size: L',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({isIndeterminate: false, size: 'L', value});
    }
  )
  .add(
    'isIndeterminate: false, variant: overBackground',
    () => {
      const value = number('Value', 32, sliderOptions);
      return (
        <div style={grayedBoxStyle}>
          {render({isIndeterminate: false, variant: 'overBackground', value})}
        </div>
      );
    }
  )
  .add(
    'isIndeterminate: false, isCentered: true',
    () => {
      const value = number('Value', 32, sliderOptions);
      return (
        <div style={centeredBoxStyle}>
          {render({isIndeterminate: false, isCentered: true, value})}
        </div>
      );
    }
  );

function render(props:ProgressCircleProps = {}) {
  return (
    <ProgressCircle {...props} />
  );
}
