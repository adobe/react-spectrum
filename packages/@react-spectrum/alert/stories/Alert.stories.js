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
import _123 from '@spectrum-icons/workflow/123';
import {Alert} from '../';
import CalendarCheckColor from '@spectrum-icons/color/CalendarCheckColor';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Alert', module)
  .addParameters({providerSwitcher: {status: "negative"}})
  .add(
    'header',
    () => render({title: 'info', variant: 'info'})
  )
  .add(
    'variant: info',
    () => render({title: 'info', variant: 'info'})
  )
  .add(
    'variant: help',
    () => render({title: 'help', variant: 'help'})
  )
  .add(
    'variant: success',
    () => render({title: 'success', variant: 'success'})
  )
  .add(
    'variant: error',
    () => render({title: 'error', variant: 'error'})
  )
  .add(
    'variant: warning',
    () => render({title: 'warning', variant: 'warning'})
  )
  .add(
    'aria-live: polite',
    () => render({title: 'error', variant: 'error', 'aria-live': 'polite'})
  )
  .add(
    'aria-live: off',
    () => render({title: 'error', variant: 'error', 'aria-live': 'off'})
  );

function render(props = {}, children = 'This is a React Spectrum alert') {
  return (
    <Alert
      {...props}>
      {children}
      <_123 />
      <CalendarCheckColor />
    </Alert>
  );
}
