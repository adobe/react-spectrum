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

import React from 'react';
import StatusLight from '../src/StatusLight';
import {storiesOf} from '@storybook/react';

storiesOf('StatusLight', module)
  .add(
    'Default',
    () => render()
  ).add(
    'variant: celery',
    () => render({variant: 'celery'})
  ).add(
    'variant: yellow',
    () => render({variant: 'yellow'})
  ).add(
    'variant: fuchsia',
    () => render({variant: 'fuchsia'})
  ).add(
    'variant: indigo',
    () => render({variant: 'indigo'})
  ).add(
    'variant: seafoam',
    () => render({variant: 'seafoam'})
  ).add(
    'variant: chartreuse',
    () => render({variant: 'chartreuse'})
  ).add(
    'variant: magenta',
    () => render({variant: 'magenta'})
  ).add(
    'variant: purple',
    () => render({variant: 'purple'})
  ).add(
    'variant: neutral',
    () => render({variant: 'neutral'})
  ).add(
    'variant: active',
    () => render({variant: 'active'})
  ).add(
    'variant: positive',
    () => render({variant: 'positive'})
  ).add(
    'variant: notice',
    () => render({variant: 'notice'})
  ).add(
    'variant: negative',
    () => render({variant: 'negative'})
  ).add(
    'disabled: true',
    () => render({disabled: true})
  );

function render(props = {}) {
  return (<StatusLight {...props}>Status light of love</StatusLight>);
}
