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
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tab, Tabs} from '../';

storiesOf('Tabs', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'orientation = vertical',
    () => render({orientation: 'vertical'})
  )
  // .addWithInfo(
  //   'orientation = vertical, icons',
  //   () => (
  //     <TabPanel orientation="vertical" onSelect={action('onSelect')}>
  //       <Tab icon={<Twitter />}>Tab Body 1</Tab>
  //       <Tab icon={<Facebook />}>Tab Body 2</Tab>
  //     </TabPanel>
  //   ),
  //   {inline: true}
  // )
  .add(
    'selectedItem = val2 (controlled)',
    () => render({selectedItem: 'val2'})
  )
  .add(
    'defaultSelectedItem = val2 (uncontrolled)',
    () => render({defaultSelectedItem: 'val2'})
  );

function render(props = {}) {
  return (
    <Tabs {...props} onSelectionChange={action('onSelectionChange')}>
      <Tab label="Tab 1" value="val1">Tab Body 1</Tab>
      <Tab label="Tab 2" value="val2">Tab Body 2</Tab>
    </Tabs>
  );
}
