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

import {ProgressBar} from '../';
import React, {CSSProperties} from 'react';
import {storiesOf} from '@storybook/react';

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
    'Default',
    (args) => render(args)
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
    args => render({size: 'S', ...args})
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
    args => render({label: null, 'aria-label': 'Loading…', ...args})
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
    'long label',
    args => render({label: 'Super long progress bar label. Sample label copy. Loading...', ...args})
  )
  .add(
    'long label, labelPosition: side',
    args => render({labelPosition: 'side', label: 'Super long progress bar label. Sample label copy. Loading...', ...args})
  )
  .add(
    'isIndeterminate: true',
    args => render({isIndeterminate: true, ...args})
  )
  .add(
    'isIndeterminate: true, size: S',
    () => render({isIndeterminate: true, size: 'S'})
  )
  .add(
    'variant: overBackground',
    args => (
      <div style={grayedBoxStyle}>
        {render({variant: 'overBackground', ...args})}
      </div>
    )
  )
  .add(
    'parent width 100%',
    () => (
      <span style={{width: '100%'}}>
        {render()}
      </span>
    )
  )
  .add(
    'parent width 100px',
    () => (
      <span style={{width: '100px'}}>
        {render()}
      </span>
    )
  )
  .add(
    'width: 300px',
    () => render({width: '300px', value: 100})
  )
  .add(
    'width: 300px, isIndeterminate: true',
    () => render({width: '300px', isIndeterminate: true})
  )
  .add(
    'width: 300px, labelPosition: side',
    () => render({width: '300px', labelPosition: 'side'})
  )
  .add(
    'width: 300px, labelPosition: side, isIndeterminate: true',
    () => render({width: '300px', labelPosition: 'side', isIndeterminate: true})
  )
  .add(
    'width: 30px',
    () => render({width: '30px'})
  )
  .add(
    'width: 30px, size: S',
    () => render({width: '30px', size: 'S'})
  )
  .add(
    'width: 30px, labelPosition: side, long label',
    () => render({width: '30px', labelPosition: 'side', label: 'Super long progress bar label. Sample label copy. Loading...'})
  )
  .add(
    'width: 30px, labelPosition: side, isIndeterminate: true, long label, button on right',
    () => (
      <>
        {render({width: '30px', labelPosition: 'side', isIndeterminate: true, label: 'Super long progress bar label. Sample label copy. Loading...'})}
        <button>Confirm</button>
      </>
    )
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
  return (<ProgressBar label="Loading…" {...props} />);
}
