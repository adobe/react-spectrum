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
import React from 'react';
import {storiesOf} from '@storybook/react';
import Textarea from '../src/Textarea';

storiesOf('Textarea', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'quiet: true',
    () => render({quiet: true})
  )
  .add(
    'disabled: true',
    () => render({disabled: true})
  )
  .add(
    'invalid: true',
    () => render({invalid: true})
  )
  .add(
    'readOnly: true',
    () => render({readOnly: true})
  )
  .add(
    'required: true',
    () => render({required: true})
  );

function render(props = {}) {
  return (
    <Textarea
      placeholder="React"
      onChange={action('change')}
      onFocus={action('focus')}
      onBlur={action('blur')}
      {...props} />
  );
}
