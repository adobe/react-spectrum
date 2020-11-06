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
import {Content, Heading, Item, Text} from '@adobe/react-spectrum';
import Dashboard from '@spectrum-icons/workflow/Dashboard';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tabs} from '..';

storiesOf('Tabs', module)
  .add(
    'Default',
    () => render({'aria-label': 'Default'})
  )
  .add(
    'with falsy item key',
    () => renderWithFalsyKey({'aria-label': 'with falsy item key'})
  )
  .add(
    'defaultSelectedKey: val2',
    () => render({'aria-label': 'defaultSelectedKey: val2', defaultSelectedKey: 'val2'})
  )
  .add(
    'controlled: selectedKey: val3',
    () => render({'aria-label': 'controlled: selectedKey: val3', selectedKey: 'val3'})
  )
  .add(
    'orientation: vertical',
    () => render({'aria-label': 'orientation: vertical', orientation: 'vertical'}))
  .add(
    'density: compact',
    () => render({'aria-label': 'density: compact', density: 'compact'}))
  .add(
    'isQuiet',
    () => render({'aria-label': 'isQuiet', isQuiet: true}))
  .add(
    'isQuiet, density: compact',
    () => render({'aria-label': 'isQuiet, density: compact', isQuiet: true, density: 'compact'})
  )
  .add(
    'density: compact, orientation: vertical',
    () => render({'aria-label': 'density: compact, orientation: vertical', density: 'compact', orientation: 'vertical'})
  )
  .add(
    'icons',
    () => renderWithIcons({'aria-label': 'icons'}))
  .add(
    'icons, density: compact',
    () => renderWithIcons({'aria-label': 'icons, density: compact', density: 'compact'})
  )
  .add(
    'icons, orientation: vertical',
    () => renderWithIcons({'aria-label': 'icons, orientation: vertical', orientation: 'vertical'})
  )
  .add(
    'icons, density: compact, orientation: vertical',
    () => renderWithIcons({'aria-label': 'icons, density: compact, orientation: vertical', orientation: 'vertical', density: 'compact'})
  )
  .add(
    'disable all tabs',
    () => render({'aria-label': 'disable all tabs', isDisabled: true}))
  .add(
    'keyboardActivation: manual',
    () => render({'aria-label': 'keyboardActivation: manual', keyboardActivation: 'manual'})
  )
  .add(
    'overflowMode: dropdown',
    () => render({'aria-label': 'overflowMode: dropdown', overflowMode: 'dropdown'})
  )
  .add(
    'overflowMode: dropdown, density: compact',
    () => render({'aria-label': 'overflowMode: dropdown, density: compact', overflowMode: 'dropdown', density: 'compact'})
  )
  .add(
    'overflowMode: dropdown, orientation: vertical',
    () => render({'aria-label': 'overflowMode: dropdown, orientation: vertical', overflowMode: 'dropdown', orientation: 'vertical'})
  )
  .add(
    'middle disabled',
    () => render({'aria-label': 'middle disabled', disabledKeys: ['val2']})
  );

function render(props = {}) {
  return (
    <Tabs {...props} maxWidth={500} onSelectionChange={action('onSelectionChange')}>
      <Item title="Tab 1" key="val1">
        <Content margin="size-160">
          <Heading>Tab Body 1</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
            Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt occaecat quis do.
            Consequat adipisicing irure Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
          </Text>
        </Content>
      </Item>
      <Item title="Tab 2" key="val2">
        <Content margin="size-160">
          <Heading>Tab Body 2</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
            Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt occaecat quis do.
            Consequat adipisicing irure Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
          </Text>
        </Content>
      </Item>
      <Item title="Tab 3" key="val3">
        <Content margin="size-160">
          <Heading>Tab Body 3</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
            Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt occaecat quis do.
            Consequat adipisicing irure Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
          </Text>
        </Content>
      </Item>
    </Tabs>
  );
}

function renderWithIcons(props = {}) {
  return (
    <Tabs {...props} maxWidth={500} onSelectionChange={action('onSelectionChange')}>
      <Item key="dashboard" icon={<Dashboard />} title="Dashboard">
        <Content margin="size-160">
          <Heading>Dashboard</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
            Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt occaecat quis do.
            Consequat adipisicing irure Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
          </Text>
        </Content>
      </Item>
      <Item key="calendar" icon={<Calendar />} title="Calendar">
        <Content margin="size-160">
          <Heading>Calendar</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
            Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt occaecat quis do.
            Consequat adipisicing irure Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
          </Text>
        </Content>
      </Item>
      <Item key="bookmark" icon={<Bookmark />} title="Bookmark">
        <Content margin="size-160">
          <Heading>Bookmark</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
            Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt occaecat quis do.
            Consequat adipisicing irure Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
          </Text>
        </Content>
      </Item>
    </Tabs>
  );
}

function renderWithFalsyKey(props = {}) {
  return (
    <Tabs {...props} maxWidth={500} onSelectionChange={action('onSelectionChange')}>
      <Item title="Tab 1" key="">
        <Content margin="size-160">
          <Heading>Tab Body 1</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
            Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt occaecat quis do.
            Consequat adipisicing irure Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
          </Text>
        </Content>
      </Item>
      <Item title="Tab 2" key="val2">
        <Content margin="size-160">
          <Heading>Tab Body 2</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
            Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt occaecat quis do.
            Consequat adipisicing irure Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
          </Text>
        </Content>
      </Item>
      <Item title="Tab 3" key="val3">
        <Content margin="size-160">
          <Heading>Tab Body 3</Heading>
          <Text>
            Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
            Id cupidatat aute id ut excepteur exercitation magna pariatur. Mollit irure irure reprehenderit pariatur eiusmod proident Lorem deserunt duis cillum mollit. Do reprehenderit sit cupidatat quis laborum in do culpa nisi ipsum. Velit aliquip commodo ea ipsum incididunt culpa nostrud deserunt incididunt exercitation. In quis proident sit ad dolore tempor. Eiusmod pariatur quis commodo labore cupidatat cillum enim eiusmod voluptate laborum culpa. Laborum cupidatat incididunt velit voluptate incididunt occaecat quis do.
            Consequat adipisicing irure Lorem commodo officia sint id. Velit sit magna aliquip eiusmod non id deserunt. Magna veniam ad consequat dolor cupidatat esse enim Lorem ullamco. Anim excepteur consectetur id in. Mollit laboris duis labore enim duis esse reprehenderit.
          </Text>
        </Content>
      </Item>
    </Tabs>
  );
}
