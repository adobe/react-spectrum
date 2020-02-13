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
import Camera from '@spectrum-icons/workflow/Camera';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tag} from '../src';

storiesOf('Tag', module)
  .add(
    'default',
    () => render({}, 'Cool tag')
  )
  .add(
    'disabled',
    () => render({isDisabled: true}, 'Cool tag')
  )
  .add(
    'icon',
    () => render({
      icon: <Camera />
    }, 'Cool tag')
  )
  .add(
    'removable',
    () => render({
      onRemove: action('onRemove'),
      isRemovable: true
    }, 'Cool tag')
  )
  .add(
    'invalid',
    () => render({
      validationState: 'invalid'
    }, 'Cool tag')
  )
  .add(
    'invalid, removable',
    () => render({
      validationState: 'invalid',
      onRemove: action('onRemove'),
      isRemovable: true
    }, 'Cool tag')
  )
  .add(
    'icon, removable',
    () => render({
      icon: <Camera />,
      onRemove: action('onRemove'),
      isRemovable: true
    }, 'Cool tag')
  )
  .add(
  'disabled, icon, removable',
  () => render({
    isDisabled: true,
    icon: <Camera />,
    onRemove: action('onRemove'),
    isRemovable: true
  }, 'Cool tag')
);

function render(props, childText: string) {
  return (
    <Tag {...props}>
      {childText}
    </Tag>
  );
}
