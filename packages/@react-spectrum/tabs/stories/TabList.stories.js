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
import {Tab, TabList} from '../';

storiesOf('TabList', module)
  .add(
    'Default',
    () => render(),
    {info: 'The page, anchored, and panel variants have been deprecated. Page is now compact, and panel/anchored tabs are just default. These variants will map properly to the new styles, but please do not specify these variants going forward.'}
  )
  .add(
    'defaultSelectedItem: val2',
    () => render({defaultSelectedItem: 'val2'})
  )
  .add(
    'selectedItem: val2',
    () => render({selectedItem: 'val2'})
  )
  .add(
    'orientation: vertical',
    () => render({orientation: 'vertical'})
  )
  .add(
    'density: compact',
    () => render({density: 'compact'})
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'isQuiet, density: compact',
    () => render({isQuiet: true, density: 'compact'})
  )
  .add(
    'icons',
    () => render({icons: true})
  )
  .add(
    'icons, orientation: vertical',
    () => render({icons: true, orientation: 'vertical'})
  )
  .add(
    'density: compact, orientation: vertical',
    () => render({density: 'compact', orientation: 'vertical'})
  )
  // .add(
  //   'icons only',
  //   () => (
  //     <TabList onSelectionChange={action('onSelectionChange')}>
  //       <Tab icon={<Twitter />} title="Twitter" aria-label="Tab 1" />
  //       <Tab icon={<Instagram />} title="Instagram" aria-label="Tab 2" />
  //       <Tab icon={<Facebook />} title="Facebook" aria-label="Tab 3" />
  //     </TabList>
  //   ),
  //   {inline: true}
  // )
  // .add(
  //   'disabled tabs',
  //   () => (
  //     <TabList onSelectionChange={action('onSelectionChange')}>
  //       <Tab icon={<Twitter />} title="Twitter">Tab 1</Tab>
  //       <Tab icon={<Instagram />} title="Instagram" disabled>Tab 2</Tab>
  //       <Tab icon={<Facebook />} title="Facebook">Tab 3</Tab>
  //     </TabList>
  //   ),
  //   {inline: true}
  // )
  .add(
    'disable all tabs',
    () => render({isDisabled: true})
  )
  .add(
    'keyboardActivation: manual',
    () => render({icons: true, keyboardActivation: 'manual'})
  );

function render(props = {}) {
  const {...otherProps} = props;
  return (
    <TabList {...otherProps} onSelectionChange={action('onSelectionChange')}>
      <Tab label="Tab 1" value="val1" />
      <Tab label="Tab 2" value="val2" />
      <Tab label="Tab 3" value="val3" />
    </TabList>
  );
}
