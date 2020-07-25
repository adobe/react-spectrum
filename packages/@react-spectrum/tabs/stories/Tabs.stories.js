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
import Bookmark from '@spectrum-icons/workflow/Bookmark';
import Calendar from '@spectrum-icons/workflow/Calendar';
import Dashboard from '@spectrum-icons/workflow/Dashboard';
import {Item} from '@adobe/react-spectrum';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tabs} from '..';

storiesOf('Tabs', module)
  .add('Default', () => render(), {
    info:
      'The page, anchored, and panel variants have been deprecated. Page is now compact, and panel/anchored tabs are just default. These variants will map properly to the new styles, but please do not specify these variants going forward.'
  })
  .add('defaultSelectedItem: val2', () =>
    render({defaultSelectedItem: 'val2'})
  )
  .add('orientation: vertical', () => render({orientation: 'vertical'}))
  .add('density: compact', () => render({density: 'compact'}))
  .add('isQuiet', () => render({isQuiet: true}))
  .add('isQuiet, density: compact', () =>
    render({isQuiet: true, density: 'compact'})
  )
  .add('density: compact, orientation: vertical', () =>
    render({density: 'compact', orientation: 'vertical'})
  )
  .add('icons', () => renderWithIcons())
  .add('icons, density: compact', () => 
    renderWithIcons({density: 'compact'})
  )
  .add('icons, orientation: vertical', () => 
    renderWithIcons({orientation: 'vertical'})
  )
  .add('icons, density: compact, orientation: vertical', () => 
    renderWithIcons({orientation: 'vertical', density: 'compact'})
  )
  .add('disable all tabs', () => render({isDisabled: true}))
  .add('keyboardActivation: manual', () =>
    render({icons: true, keyboardActivation: 'manual'})
  );

function render(props = {}) {
  return (
    <Tabs {...props} onSelectionChange={action('onSelectionChange')}>
      <Item title="Tab 1" key="val1">Tab Body 1</Item>
      <Item title="Tab 2" key="val2">Tab Body 2</Item>
      <Item title="Tab 3" key="val3">Tab Body 3</Item>
    </Tabs>
  );
}

function renderWithIcons(props = {}) {
  return (
    <Tabs {...props} onSelectionChange={action('onSelectionChange')}>
      <Item key="dashboard" icon={<Dashboard />} title="Dashboard">
        Dashboard
      </Item>
      <Item key="calendar" icon={<Calendar />} title="Calendar">
        Calendar
      </Item>
      <Item key="bookmark" icon={<Bookmark />} title="Bookmark">
        Bookmark
      </Item>
    </Tabs>
  );
}
