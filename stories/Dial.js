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
import Dial from '../src/Dial';
import FieldLabel from '../src/FieldLabel';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Dial', module)
  .add(
    'renderLabel: true',
    () => render({renderLabel: true, label: 'Label'})
  )
  .add(
    'size: L',
    () => render({variant: 'round', label: 'size: L'})
  )
  .add(
    'size: S',
    () => render({variant: 'round', size: 'S', label: 'size: S'})
  )
  .add(
    'step',
    () => render({step: 25})
  )
  .add(
    'disabled',
    () => render({disabled: true})
  )
  .add(
    'variant: with aria-label',
    () => render({renderLabel: true, 'aria-label': 'variant: with aria-label'})
  )
  .add(
    'variant: with aria-labelledby',
    () => (
      <div>
        <FieldLabel label="Label" labelFor="foo" id="bar" />
        {render({id: 'foo', 'aria-labelledby': 'bar'})}
      </div>
    )
  );

function render(props = {}) {
  return (
    <Dial
      onChange={action('change')}
      {...props} />
  );
}
