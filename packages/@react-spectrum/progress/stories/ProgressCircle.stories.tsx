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

import {ProgressCircle} from '../';
import React, {CSSProperties} from 'react';
import {storiesOf} from '@storybook/react';

const grayedBoxStyle: CSSProperties = {
  width: '100px',
  height: '100px',
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

storiesOf('Progress/ProgressCircle', module)
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
    args => render(args)
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
    args => render({...args, size: 'S'})
  )
  .add(
    'size: L',
    args => render({...args, size: 'L'})
  )
  .add(
    'variant: overBackground',
    args =>  (
      <div style={grayedBoxStyle}>
        {render({...args, variant: 'overBackground'})}
      </div>
    )
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
  );

function render(props = {}) {
  return (
    <ProgressCircle aria-label="Loading…" {...props} />
  );
}
