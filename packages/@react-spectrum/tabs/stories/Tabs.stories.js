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
import Bell from '@spectrum-icons/workflow/Bell';
import {Item} from '@adobe/react-spectrum';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tabs} from '..';

storiesOf('Tabs', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'orientation = vertical',
    () => render({orientation: 'vertical'})
  )
  .add(
    'orientation = vertical, icons',
    () => (
      <Tabs orientation="vertical" onSelect={action('onSelect')}>
        <Item icon={<Bell />} key="Bell1" title="Bell">Tab Body 1</Item>
        <Item icon={<Bell />} key="Bell2" title="Bell">Tab Body 2</Item>
      </Tabs>
    )
  )
  .add(
    'selectedItem = val2 (controlled)',
    () => render({selectedItem: 'val2'})
  )
  .add(
    'defaultSelectedItem = val2 (uncontrolled)',
    () => render({defaultSelectedItem: 'val2'})
  )
  .add('keyboardActivation = manual',
    () => render({keyboardActivation: 'manual'})
  );

function render(props = {}) {
  return (
    <Tabs {...props} onSelectionChange={action('onSelectionChange')}>
      <Item title="Tab 1" key="val1">Tab Body 1</Item>
      <Item title="Tab 2" key="val2">Tab Body 2</Item>
    </Tabs>
  );
}
