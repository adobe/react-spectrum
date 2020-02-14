/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

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
  .addParameters({providerSwitcher: {status: 'positive'}})
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
      return render({label: null, 'aria-label': 'Meter', value});
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
    <Meter label="Meter" variant="positive" {...props} />
  );
}
