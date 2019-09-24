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

import {action} from '@storybook/addon-actions';
import FieldLabel from '../src/FieldLabel';
import React from 'react';
import Slider from '../src/Slider';
import {storiesOf} from '@storybook/react';

storiesOf('Slider', module)
  .add(
    'Default',
    () => render({label: 'Default'})
  )
  .add(
    'Min = 10, max = 20, Step = 1',
    () => render({min: 10, max: 20, step: 1, label: 'Min = 10, max = 20, Step = 1'})
  )
  .add(
    'Default value',
    () => render({defaultValue: 75, label: 'Default value'})
  )
  .add(
    'Controlled value',
    () => render({value: 75, label: 'Controlled value'})
  )
  /* Spectrum-css has not implemented vertical variant
  .add(
    'Vertical',
    () => render({orientation: 'vertical'})
  )
  .add(
    'Vertical step = 1',
    () => render({orientation: 'vertical', min: 0, max: 10, step: 1})
  )
  */
  .add(
    'renderLabel: true',
    () => render({renderLabel: true, label: 'Rendered Label'})
  )
  .add(
    'filled',
    () => render({filled: true, renderLabel: true, label: 'filled'})
  )
  .add(
    'variant: filled with offset',
    () => render({filled: true, fillOffset: 50, defaultValue: 20, renderLabel: true, label: 'filled offset'})
  )
  .add(
    'variant: ramp',
    () => render({variant: 'ramp', renderLabel: true, label: 'variant: ramp'})
  )
  .add(
    'variant: range',
    () => render({variant: 'range', renderLabel: true, label: 'variant: range'})
  )
  .add(
    'variant: range Default values',
    () => render({variant: 'range', defaultStartValue: 20, defaultEndValue: 60, renderLabel: true, label: 'variant: range Default values'})
  )
  .add(
    'variant: range Controlled values',
    () => render({variant: 'range', startValue: 45, endValue: 75, renderLabel: true, label: 'variant: range Controlled values'})
  )
  .add(
    'variant: range Min = 10, max = 20, Step = 1',
    () => render({variant: 'range', min: 10, max: 20, step: 1, renderLabel: true, label: 'variant: range Min = 10, max = 20, Step = 1'})
  )
  .add(
    'disabled',
    () => render({disabled: true})
  )
  .add(
    'variant: range disabled',
    () => render({disabled: true, variant: 'range', filled: true, renderLabel: true, label: 'variant: range disabled'})
  )
  .add(
    'labeled using aria-labelledby',
    () => (
      <div>
        <FieldLabel label="variant: range with aria-labelledby" labelFor="foo" id="bar" />
        {render({variant: 'range', filled: true, id: 'foo', 'aria-labelledby': 'bar', 'aria-label': 'labeled using aria-labelledby'})}
      </div>
    )
  )
  .add(
    'getAriaValueText',
    () => render({
      variant: 'range',
      min: 0,
      max: 1440,
      step: 15,
      defaultStartValue: 600,
      defaultEndValue: 840,
      renderLabel: true,
      label: 'Time span',
      getAriaValueText: minutes => {
        const date = new Date();
        date.setHours(Math.floor(minutes / 60));
        date.setMinutes(minutes % 60);
        return date.toLocaleTimeString('en-us', {hour: '2-digit', minute: '2-digit'});
      }
    })
  );

function render(props = {}) {
  return (
    <Slider
      onChange={action('change')}
      {...props} />
  );
}
