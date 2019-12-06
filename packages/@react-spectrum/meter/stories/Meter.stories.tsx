import {Meter} from '../';
import {number, withKnobs} from '@storybook/addon-knobs';
import React from 'react';
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

storiesOf('Meter', module)
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
    'children: React',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({children: 'React', value});
    }
  )
  .add(
    'labelPosition: side',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({children: 'React', value, showValueLabel: true, labelPosition: 'side'});
    }
  )
  .add(
    'labelPosition: top',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({children: 'React', value, showValueLabel: true, labelPosition: 'top'});
    }
  )
  .add(
    'variant: positive',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({variant: 'positive', value});
    }
  )
  .add(
    'variant: critical',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({variant: 'critical', value});
    }
  )
  .add(
    'variant: warning',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({variant: 'warning', value});
    }
  )
  .add(
    'Using raw values for min, max, and value',
    () => render({
      children: 'Loading…',
      showValueLabel: true,
      labelPosition: 'top',
      max: 2147483648,
      value: 715827883
    })
  )
  .add(
    'Using raw values with number formatter',
    () => render({
      children: 'Loading…',
      showValueLabel: true,
      labelPosition: 'top',
      max: 2147483648,
      value: 715827883,
      formatOptions
    })
  );

function render(props = {}) {
  return (
    <Meter
      aria-label="Meter aria label"
      {...props} />
  );
}
