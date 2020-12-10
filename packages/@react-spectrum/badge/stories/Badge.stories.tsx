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

import {action} from '@storybook/addon-actions';
import {Badge, BadgeProps} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Badge', module)
  .add(
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
    'variant: info',
    () => render({variant: 'info'})
  ).add(
    'variant: positive',
    () => render({variant: 'positive'})
  ).add(
    'variant: notice',
    () => render({variant: 'notice'})
  ).add(
    'variant: negative',
    () => render({variant: 'negative'})
  );

function render(props: any = {}) {
  return <Badge {...props}>Badge of honor</Badge>;
}
