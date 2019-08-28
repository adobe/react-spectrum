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
import Checkbox from '../src/Checkbox';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Checkbox', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'defaultChecked: true',
    () => render({defaultChecked: true})
  )
  .add(
    'checked: true',
    () => render({checked: true})
  )
  .add(
    'checked: false',
    () => render({checked: false})
  )
  .add(
    'indeterminate: true',
    () => render({indeterminate: true})
  )
  .add(
    'invalid: true',
    () => render({invalid: true})
  )
  .add(
    'disabled: true',
    () => render({disabled: true})
  )
  .add(
    'quiet: true',
    () => render({quiet: true})
  )
  .add(
    'quiet: true, indeterminate: true',
    () => render({quiet: true, indeterminate: true})
  )
  .add(
    'quiet: true, invalid: true',
    () => render({quiet: true, invalid: true})
  )
  .add(
    'quiet: true, invalid: true, indeterminate: true',
    () => render({quiet: true, invalid: true, indeterminate: true})
  )
  .add(
    'quiet: true, disabled: true',
    () => render({quiet: true, disabled: true})
  )
  .add(
    'Label Not Set',
    () => render({label: null, 'aria-label': 'React'})
  )
  .add(
    'renderLabel: false',
    () => render({renderLabel: false, label: 'React checkbox'})
  )
  .add(
    'custom label',
    () => renderCustomLabel()
  );

function render(props = {}) {
  return (
    <Checkbox
      label="React"
      onChange={action('change')}
      {...props}>
      {
        props.renderLabel === false && 'with renderLabel: false'
      }
    </Checkbox>
  );
}

function renderCustomLabel(props = {}) {
  return (
    <Checkbox
      onChange={action('change')}
      {...props}>
      <span><i>Italicized</i> Checkbox Label</span>
    </Checkbox>
  );
}
