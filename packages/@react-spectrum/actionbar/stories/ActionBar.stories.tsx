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
import {Example} from './Example';
import React from 'react';
import {useViewportSize} from '@react-aria/utils';

export default {
  title: 'ActionBar'
};

export const Default = () => <Example onAction={action('onAction')} />;

Default.story = {
  name: 'default'
};

export const IsEmphasized = () => (
  <Example isEmphasized onAction={action('onAction')} />
);

IsEmphasized.story = {
  name: 'isEmphasized'
};

export const FullWidth = () => {
  let viewport = useViewportSize();
  return (
    <Example
      isEmphasized
      tableWidth="100vw"
      containerHeight={viewport.height}
      isQuiet
      onAction={action('onAction')} />
  );
};

FullWidth.story = {
  name: 'full width'
};
