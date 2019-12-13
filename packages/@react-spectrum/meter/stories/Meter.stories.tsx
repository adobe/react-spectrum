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
      return render({children: null, 'aria-label': 'Meter', value});
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
    <Meter {...props} variant={props.variant || 'positive'}>{props.children === null ? null : props.children || 'Meter'}</Meter>
  );
}
