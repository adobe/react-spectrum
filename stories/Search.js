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
import Refresh from '../src/Icon/Refresh';
import Search from '../src/Search';
import {storiesOf} from '@storybook/react';

storiesOf('Search', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'defaultValue (uncontrolled)',
    () => render({defaultValue: 'React'})
  )
  .add(
    'value (controlled)',
    () => render({value: 'React'})
  )
  .add(
    'disabled: true',
    () => render({value: 'React', disabled: true})
  )
  .add(
    'icon: refresh',
    () => render({value: 'React', icon: <Refresh />})
  )
  .add(
    'quiet',
    () => render({quiet: true})
  )
  .add(
    'quiet disabled',
    () => render({quiet: true, disabled: true})
  )
  .add(
    'quiet icon: refresh',
    () => render({quiet: true, icon: <Refresh />})
  );

function render(props = {}) {
  return (
    <Search
      placeholder="Enter text"
      {...props}
      onChange={action('change')}
      onSubmit={action('submit')} />
  );
}
