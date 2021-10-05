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
import {Tag} from '../src';

export default {
  title: 'Tag'
};

export const Default = () => render({}, 'Cool tag');

Default.story = {
  name: 'default'
};

export const Disabled = () => render({isDisabled: true}, 'Cool tag');

Disabled.story = {
  name: 'disabled'
};

export const Icon = () =>
  render(
    {
      icon: <Camera />
    },
    'Cool tag'
  );

Icon.story = {
  name: 'icon'
};

export const Removable = () =>
  render(
    {
      onRemove: action('onRemove'),
      isRemovable: true
    },
    'Cool tag'
  );

Removable.story = {
  name: 'removable'
};

export const Invalid = () =>
  render(
    {
      validationState: 'invalid'
    },
    'Cool tag'
  );

Invalid.story = {
  name: 'invalid'
};

export const InvalidRemovable = () =>
  render(
    {
      validationState: 'invalid',
      onRemove: action('onRemove'),
      isRemovable: true
    },
    'Cool tag'
  );

InvalidRemovable.story = {
  name: 'invalid, removable'
};

export const IconRemovable = () =>
  render(
    {
      icon: <Camera />,
      onRemove: action('onRemove'),
      isRemovable: true
    },
    'Cool tag'
  );

IconRemovable.story = {
  name: 'icon, removable'
};

export const DisabledIconRemovable = () =>
  render(
    {
      isDisabled: true,
      icon: <Camera />,
      onRemove: action('onRemove'),
      isRemovable: true
    },
    'Cool tag'
  );

DisabledIconRemovable.story = {
  name: 'disabled, icon, removable'
};

function render(props, childText: string) {
  return <Tag {...props}>{childText}</Tag>;
}
