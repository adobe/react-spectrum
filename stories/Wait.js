/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {number, withKnobs} from '@storybook/addon-knobs';
import React from 'react';
import {storiesOf} from '@storybook/react';

import Wait from '../src/Wait';

const sliderOptions = {
  range: true,
  min: 0,
  max: 100,
  step: 1
};

storiesOf('Wait', module)
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
    }
  )
  .add(
    'centered: true',
    () => {
      const style = {
        'width': '100px',
        'height': '100px',
        'position': 'relative',
        'border-color': 'black',
        'border-style': 'solid'
      };

      return (
        <div style={style}>
          {render({centered: true})}
        </div>
      );
    }
  )
  .add(
    'indeterminate: false',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({indeterminate: false, value});
    },
    {info: 'Adjust the slider in the knobs tab below to change the value'}
  )
  .add(
    'indeterminate: false, size: S',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({indeterminate: false, size: 'S', value});
    },
    {info: 'Adjust the slider in the knobs tab below to change the value'}
  )
  .add(
    'indeterminate: false, size: L',
    () => {
      const value = number('Value', 32, sliderOptions);
      return render({indeterminate: false, size: 'L', value});
    },
    {info: 'Adjust the slider in the knobs tab below to change the value'}
  )
  .add(
    'indeterminate: false, variant: overBackground',
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
    {info: 'Adjust the slider in the knobs tab below to change the value'}
  )
  .add(
    'indeterminate: false, centered: true',
    () => {
      const value = number('Value', 32, sliderOptions);
      const style = {
        'width': '100px',
        'height': '100px',
        'position': 'relative',
        'border-color': 'black',
        'border-style': 'solid'
      };

      return (
        <div style={style}>
          {render({indeterminate: false, centered: true, value})}
        </div>
      );
    },
    {info: 'Adjust the slider in the knobs tab below to change the value'}
  );

function render(props = {}) {
  return (
    <Wait {...props} />
  );
}
