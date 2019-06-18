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
import NumberInput from '../src/NumberInput';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('NumberInput', module)
  .add(
    'default',
    () => render(),
    {info: 'NumberInput only accepts numeric values.  Values can be changed by using the step buttons or mouse scroll wheel while focused on the input.  The up/down arrow, page up/down, and home/end keys will also change values.  If min or max are defined and the value extends outside of the range the component marks itself as invalid.'}
  )
  .add(
    'min: -5, max: 10, step: 0.5',
    () => render({min: -5, max: 10, step: 0.5, placeholder: 'Type something please'}),
    {info: 'Demonstrating a -5 - 10 range input with 0.5 step'}
  )
  .add(
    'invalid',
    () => render({invalid: true}),
    {info: 'Demonstrating invalid'}
  )
  .add(
    'disabled',
    () => render({disabled: true}),
    {info: 'Demonstrating disabled'}
  )
  .add(
    'quiet',
    () => render({quiet: true}),
    {info: 'Demonstrating quiet'}
  );

const render = (props = {}) => (
  <NumberInput {...props} onChange={action('change')} />
);
