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
import {ActionGroup} from '../';
import Add from '@spectrum-icons/workflow/Add';
import Bell from '@spectrum-icons/workflow/Bell';
import Brush from '@spectrum-icons/workflow/Brush';
import Camera from '@spectrum-icons/workflow/Camera';
import CheckmarkCircle from '@spectrum-icons/workflow/CheckmarkCircle';
import Delete from '@spectrum-icons/workflow/Delete';
import {Item} from '@react-stately/collections';
import React from 'react';
import RegionSelect  from '@spectrum-icons/workflow/RegionSelect';
import Select  from '@spectrum-icons/workflow/Select';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/text';
import Undo from '@spectrum-icons/workflow/Undo';
import {Flex} from "@react-spectrum/layout";

const items =
  [
    {children: 'React', name: 'React'},
    {children: 'Add', name: 'Add'},
    {children: 'Delete', name: 'Delete'},
    {children: 'Bell', name: 'Bell'},
    {children: 'Camera', name: 'Camera'},
    {children: 'Undo', name: 'Undo'}
  ];

storiesOf('ActionGroup', module)
  .addParameters({providerSwitcher: {status: 'negative'}})
  .add(
    'default',
    () => render(null, items)
  )
  .add(
    'icons',
    () => render()
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'isEmphasized',
    () => render({isEmphasized: true})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true})
  )
  .add(
    'density: compact',
    () => render({density: 'compact'})
  )
  .add(
    'density: compact, isJustified',
    () => (
      <div style={{width: '600px'}}>
        {render({density: 'compact', isJustified: true})}
      </div>
    )
  )
  .add(
    'density: compact, isEmphasized',
    () => render({density: 'compact', isEmphasized: true})
  )
  .add(
    'selectionMode: none',
    () => render({selectionMode: 'none', onAction: action('onAction')})
  )
  .add(
    'selectionMode: multiple',
    () => render({selectionMode: 'multiple'})
  )
  .add(
    'selectionMode: multiple, density: compact, isEmphasized',
    () => render({density: 'compact', isEmphasized: true, selectionMode: 'multiple'})
  )
  .add(
    'orientation: vertical',
    () => render({orientation: 'vertical'})
  )
  .add(
    'icons only',
    () => render({}, toolIcons)
  )
  .add(
    'icons only, isQuiet',
    () => render({isQuiet: true}, toolIcons)
  )
  .add(
    'icons only, orientation: vertical',
    () => render({orientation: 'vertical'}, toolIcons)
  )
  .add(
    'icons only, orientation: vertical, isQuiet',
    () => render({orientation: 'vertical', isQuiet: true}, toolIcons)
  )
  .add(
    'defaultSelectedKeys',
    () => render({defaultSelectedKeys: ['Add', 'Delete'], selectionMode: 'multiple'})
  )
  .add(
    'selectedKeys (controlled)',
    () => render({selectedKeys: ['Add', 'Delete'], selectionMode: 'multiple'})
  )
  .add(
    'disabledKeys',
    () => render({disabledKeys: ['Add', 'Delete'], selectionMode: 'multiple'})
  )
  .add(
    'the big one',
    () => renderBigOne()
  )
  .add(
    'dynamic',
    () => (
      <ActionGroup onSelectionChange={s => onSelectionChange([...s])} items={items}>
        {item => <Item key={item.name} textValue={item.name}>{item.children}</Item>}
      </ActionGroup>
    )
  );

const itemsWithIcons =
  [
    {children: <><CheckmarkCircle /><Text>React</Text></>, name: 'React'},
    {children: <><Add /><Text>Add</Text></>, name: 'Add'},
    {children: <><Delete /><Text>Delete</Text></>, name: 'Delete'},
    {children: <><Bell /><Text>Bell</Text></>, name: 'Bell'},
    {children: <><Camera /><Text>Camera</Text></>, name: 'Camera'},
    {children: <><Undo /><Text>Undo</Text></>, name: 'Undo'}
  ];

const toolIcons =
  [
    {children: <Brush />, 'aria-label': 'Brush'},
    {children: <Select />, 'aria-label': 'Select'},
    {children: <RegionSelect />, 'aria-label': 'RegionSelect'}
  ];

let onSelectionChange = action('onSelectionChange');
function render(props = {}, items: any = itemsWithIcons) {
  return (
    <ActionGroup onSelectionChange={s => onSelectionChange([...s])} {...props}>
      {
        items.map((itemProps) => (
          <Item key={itemProps.name} textValue={itemProps.name} {...itemProps} />
        ))
      }
    </ActionGroup>
  );
}

function renderBigOne() {
  return (
    <Flex direction="column" gap="size-100" width="600px">
      <Flex><div style={{flex: '1'}}>Horizontal</div><div style={{flex: '1'}}>{render({}, [{children: 'Document setup'}, {children: 'Settings'}])}</div></Flex>
      <Flex><div style={{flex: '1'}}>Horizontal / Compact</div><div style={{flex: '1'}}>{render({density: 'compact'}, [{children: 'Grid View'}, {children: 'List view'}, {children: 'Gallery view'}])}</div></Flex>
      <Flex><div style={{flex: '1'}}>Horizontal / Justified</div><div style={{flex: '1'}}>{render({isJustified: true}, [{children: 'Grid View'}, {children: 'List view'}])}</div></Flex>
      <Flex><div style={{flex: '1'}}>Horizontal / Compact / Justified</div><div style={{flex: '1'}}>{render({isJustified: true, density: 'compact'}, [{children: 'Grid View'}, {children: 'List view'}])}</div></Flex>
      <Flex><div style={{flex: '1'}}>Horizontal / Quiet</div><div style={{flex: '1'}}>{render({isQuiet: true}, [{children: 'Edit'}, {children: 'Copy'}, {children: 'Delete'}])}</div></Flex>
      <Flex><div style={{flex: '1'}}>Horizontal / Compact / Quiet</div><div style={{flex: '1'}}>{render({density: 'compact', isQuiet: true}, [{children: 'Edit'}, {children: 'Copy'}, {children: 'Delete'}])}</div></Flex>
      <Flex><div style={{flex: '1'}}>Horizontal / Single</div><div style={{flex: '1'}}>{render({selectedKeys: ['1']}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div></Flex>
      <Flex><div style={{flex: '1'}}>Horizontal / Compact / Single</div><div style={{flex: '1'}}>{render({selectedKeys: ['1']}, [{children: 'Grid View', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}])}</div></Flex>

    </Flex>
  );
}
