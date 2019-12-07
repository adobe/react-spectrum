import {number, withKnobs} from '@storybook/addon-knobs';
import {ProgressBar} from '../';
import React, {CSSProperties} from 'react';
import {storiesOf} from '@storybook/react';

const sliderOptions = {
  range: true,
  min: 0,
  max: 100,
  step: 1
};

const formatOptions = {
  style: 'currency',
  currency: 'JPY'
};

const grayedBoxStyle: CSSProperties = {
  width: '250px',
  height: '60px',
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

storiesOf('Progress/ProgressBar', module)
  .addDecorator(withKnobs)
  .add(
    'Default',
    () => render()
  )
  .add(
    'value: 50',
    () => render({value: 50})
  )
  .add(
    'value: 100',
    () => render({value: 100})
  )
  .add(
    'size: S',
    () => {
      const value = number('Value', 50, sliderOptions);
      return render({value, size: 'S'});
    }
  )
  .add(
    'showValueLabel: true',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({showValueLabel: true, value});
    }
  )
  .add(
    'showValueLabel: false',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({showValueLabel: false, value});
    }
  )
  .add(
    'valueLabel: 1 of 4',
    () => render({value: 25, valueLabel: '1 of 4'})
  )
  .add(
    'Using number formatOptions with currency style',
    () => {
      const value = number('Value', 60, sliderOptions);
      return render({
        showValueLabel: true,
        value,
        formatOptions
      });
    }
  )
  .add(
    'no visible label',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({children: null, 'aria-label': 'Loading…', value});
    }
  )
  .add(
    'labelPosition: side',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({value, labelPosition: 'side'});
    }
  )
  .add(
    'labelPosition: top',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({value, labelPosition: 'top'});
    }
  )
  .add(
    'isIndeterminate: true',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({isIndeterminate: true, value});
    }
  )
  .add(
    'isIndeterminate: true, size: S',
    () => render({isIndeterminate: true, size: 'S'})
  )
  .add(
    'variant: overBackground',
    () => {
      const value = number('Value', 32, sliderOptions);
      return (
        <div style={grayedBoxStyle}>
          {render({variant: 'overBackground', value})}
        </div>
      );
    }
  )
  .add(
    'Using raw values for minValue, maxValue, and value',
    () => render({
      showValueLabel: true,
      labelPosition: 'top',
      maxValue: 2147483648,
      value: 715827883
    })
  )
  .add(
    'Using raw values with number formatter',
    () => render({
      showValueLabel: true,
      labelPosition: 'top',
      maxValue: 2147483648,
      value: 715827883,
      formatOptions
    })
  );

function render(props: any = {}) {
  return (
    <ProgressBar {...props}>{props.children === null ? null : props.children || 'Loading…'}</ProgressBar>
  );
}
