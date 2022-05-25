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
import React from 'react';
import {storiesOf} from '@storybook/react';

const formatOptions = {
  style: 'currency',
  currency: 'JPY'
};

storiesOf('Meter', module)
  .addParameters({
    providerSwitcher: {status: 'positive'},
    args: {value: 32},
    argTypes: {
      value: {
        control: {
          type: 'range',
          min: 0,
          max: 100
        }
      }
    }
  })
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
    args => render({...args, size: 'S'})
  )
  .add(
    'showValueLabel: true',
    args =>  render({showValueLabel: true, ...args})
  )
  .add(
    'showValueLabel: false',
    args => render({showValueLabel: false, ...args})
  )
  .add(
    'valueLabel: 1 of 4',
    () => render({value: 25, valueLabel: '1 of 4'})
  )
  .add(
    'Using number formatOptions with currency style',
    args => render({
      ...args,
      showValueLabel: true,
      formatOptions
    })
  )
  .add(
    'no visible label',
    args => render({label: null, 'aria-label': 'Meter', ...args})
  )
  .add(
    'labelPosition: side',
    args => render({labelPosition: 'side', ...args})
  )
  .add(
    'labelPosition: top',
    args => render({labelPosition: 'top', ...args})
  )
  .add(
    'variant: positive',
    args => render({variant: 'positive', ...args})
  )
  .add(
    'variant: critical',
    args => render({variant: 'critical', ...args})
  )
  .add(
    'variant: warning',
    args => render({variant: 'warning', ...args})
  )
  .add(
    'parent width 100%',
    () => (
      <span style={{width: '100%'}}>
        {render({value: 32})}
      </span>
    )
  )
  .add(
    'parent width 100px',
    () => (
      <span style={{width: '100px'}}>
        {render({value: 32})}
      </span>
    )
  )
  .add(
    'width: 300px',
    () => render({value: 32, width: '300px'})
  )
  .add(
    'width: 300px, labelPosition: side',
    () => render({value: 32, width: '300px', labelPosition: 'side'})
  )
  .add(
    'width: 30px',
    () => render({value: 32, width: '30px'})
  )
  .add(
    'width: 30px, labelPosition: side',
    () => render({value: 32, width: '30px', labelPosition: 'side'})
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
