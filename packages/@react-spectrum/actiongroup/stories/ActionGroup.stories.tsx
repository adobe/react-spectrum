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
import BookIcon from '@spectrum-icons/workflow/Book';
import Brush from '@spectrum-icons/workflow/Brush';
import Camera from '@spectrum-icons/workflow/Camera';
import CheckmarkCircle from '@spectrum-icons/workflow/CheckmarkCircle';
import CopyIcon from '@spectrum-icons/workflow/Copy';
import DeleteIcon from '@spectrum-icons/workflow/Delete';
import DocumentIcon from '@spectrum-icons/workflow/Document';
import DrawIcon from '@spectrum-icons/workflow/Draw';
import {Flex} from '@react-spectrum/layout';
import InfoIcon from '@spectrum-icons/workflow/Info';
import {Item} from '@react-stately/collections';
import PropertiesIcon from '@spectrum-icons/workflow/Properties';
import React from 'react';
import RegionSelect  from '@spectrum-icons/workflow/RegionSelect';
import Select  from '@spectrum-icons/workflow/Select';
import SettingsIcon from '@spectrum-icons/workflow/Settings';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/text';
import Undo from '@spectrum-icons/workflow/Undo';
import ViewCardIcon from '@spectrum-icons/workflow/ViewCard';
import ViewGridIcon from '@spectrum-icons/workflow/ViewGrid';
import ViewListIcon from '@spectrum-icons/workflow/ViewList';

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
    {children: <><DeleteIcon /><Text>Delete</Text></>, name: 'Delete'},
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
let iconMap = {
  'Document setup': DocumentIcon,
  'Settings': SettingsIcon,
  'Grid view': ViewGridIcon,
  'List view': ViewListIcon,
  'Gallery view': ViewCardIcon,
  'Edit': DrawIcon,
  'Copy': CopyIcon,
  'Delete': DeleteIcon,
  'Properties': PropertiesIcon,
  'Info': InfoIcon,
  'Keywords': BookIcon
};
function renderBoth(props, items: any = itemsWithIcons) {
  return (
    <ActionGroup onSelectionChange={s => onSelectionChange([...s])} {...props}>
      {
        items.map((itemProps) => {
          let IconElement = iconMap[itemProps.children];
          return (
            <Item key={itemProps.name} textValue={itemProps.name}>
              <Text>{itemProps.children}</Text>
              <IconElement />
            </Item>
          );
        })
      }
    </ActionGroup>
  );
}

function renderIcons(props, items: any = itemsWithIcons) {
  return (
    <ActionGroup onSelectionChange={s => onSelectionChange([...s])} {...props}>
      {
        items.map((itemProps) => {
          let IconElement = iconMap[itemProps.children];
          return (
            <Item key={itemProps.name} textValue={itemProps.name}>
              <IconElement />
            </Item>
          );
        })
      }
    </ActionGroup>
  );
}

function renderBigOne() {
  return (
    <Flex direction="column" gap="size-300" width="1600px" margin="size-300" marginTop="size-900">
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal</div>
        <div style={{flex: '1'}}>{render({}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Compact</div>
        <div style={{flex: '1'}}>{render({density: 'compact'}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({density: 'compact'}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({density: 'compact'}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Justified</div>
        <div style={{flex: '1'}}>{render({isJustified: true}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({isJustified: true}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({isJustified: true}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Compact / Justified</div>
        <div style={{flex: '1'}}>{render({isJustified: true, density: 'compact'}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({isJustified: true, density: 'compact'}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({isJustified: true, density: 'compact'}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Quiet</div>
        <div style={{flex: '1'}}>{render({isQuiet: true}, [{children: 'Edit', name: '1'}, {children: 'Copy', name: '2'}, {children: 'Delete', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({isQuiet: true}, [{children: 'Edit', name: '1'}, {children: 'Copy', name: '2'}, {children: 'Delete', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({isQuiet: true}, [{children: 'Edit', name: '1'}, {children: 'Copy', name: '2'}, {children: 'Delete', name: '3'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Compact / Quiet</div>
        <div style={{flex: '1'}}>{render({density: 'compact', isQuiet: true}, [{children: 'Edit', name: '1'}, {children: 'Copy', name: '2'}, {children: 'Delete', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({density: 'compact', isQuiet: true}, [{children: 'Edit', name: '1'}, {children: 'Copy', name: '2'}, {children: 'Delete', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({density: 'compact', isQuiet: true}, [{children: 'Edit', name: '1'}, {children: 'Copy', name: '2'}, {children: 'Delete', name: '3'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Single</div>
        <div style={{flex: '1'}}>{render({selectedKeys: ['1']}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({selectedKeys: ['1']}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({selectedKeys: ['1']}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Compact / Single</div>
        <div style={{flex: '1'}}>{render({selectedKeys: ['1'], density: 'compact'}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({selectedKeys: ['1'], density: 'compact'}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({selectedKeys: ['1'], density: 'compact'}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Justified / Single</div>
        <div style={{flex: '1'}}>{render({selectedKeys: ['1'], isJustified: true}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({selectedKeys: ['1'], isJustified: true}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({selectedKeys: ['1'], isJustified: true}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Justified / Compact / Single</div>
        <div style={{flex: '1'}}>{render({selectedKeys: ['1'], density: 'compact'}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({selectedKeys: ['1'], density: 'compact'}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({selectedKeys: ['1'], density: 'compact'}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Quiet / Single</div>
        <div style={{flex: '1'}}>{render({selectedKeys: ['1'], isQuiet: true}, [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({selectedKeys: ['1'], isQuiet: true}, [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({selectedKeys: ['1'], isQuiet: true}, [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Compact / Quiet / Single</div>
        <div style={{flex: '1'}}>{render({selectedKeys: ['1'], isQuiet: true, density: 'compact'}, [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({selectedKeys: ['1'], isQuiet: true, density: 'compact'}, [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({selectedKeys: ['1'], isQuiet: true, density: 'compact'}, [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}])}</div>
      </Flex>

      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Emphasis / Single</div>
        <div style={{flex: '1'}}>{render({selectedKeys: ['1'], isEmphasized: true}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({selectedKeys: ['1'], isEmphasized: true}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({selectedKeys: ['1'], isEmphasized: true}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Compact / Emphasis / Single</div>
        <div style={{flex: '1'}}>{render({selectedKeys: ['1'], isEmphasized: true, density: 'compact'}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({selectedKeys: ['1'], isEmphasized: true, density: 'compact'}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({selectedKeys: ['1'], isEmphasized: true, density: 'compact'}, [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Quiet / Emphasis / Single</div>
        <div style={{flex: '1'}}>{render({selectedKeys: ['1'], isEmphasized: true, isQuiet: true}, [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({selectedKeys: ['1'], isEmphasized: true, isQuiet: true}, [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({selectedKeys: ['1'], isEmphasized: true, isQuiet: true}, [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Quiet / Multi</div>
        <div style={{flex: '1'}}>{render({selectedKeys: ['1', '2'], isQuiet: true, selectionMode: 'multiple'}, [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({selectedKeys: ['1', '2'], isQuiet: true, selectionMode: 'multiple'}, [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({selectedKeys: ['1', '2'], isQuiet: true, selectionMode: 'multiple'}, [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Horizontal / Quiet / Emphasis / Multi</div>
        <div style={{flex: '1'}}>{render({selectedKeys: ['1', '2'], isQuiet: true, selectionMode: 'multiple', isEmphasized: true}, [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({selectedKeys: ['1', '2'], isQuiet: true, selectionMode: 'multiple', isEmphasized: true}, [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({selectedKeys: ['1', '2'], isQuiet: true, selectionMode: 'multiple', isEmphasized: true}, [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Vertical</div>
        <div style={{flex: '1'}}>{render({orientation: 'vertical'}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({orientation: 'vertical'}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({orientation: 'vertical'}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Vertical / Justified</div>
        <div style={{flex: '1'}}>{render({orientation: 'vertical', isJustified: true}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({orientation: 'vertical', isJustified: true}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({orientation: 'vertical', isJustified: true}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Vertical / Compact / Justified</div>
        <div style={{flex: '1'}}>{render({orientation: 'vertical', isJustified: true, density: 'compact'}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({orientation: 'vertical', isJustified: true, density: 'compact'}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({orientation: 'vertical', isJustified: true, density: 'compact'}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
      </Flex>
      <Flex gap="size-100" >
        <div style={{flex: '1'}}>Vertical / Quiet</div>
        <div style={{flex: '1'}}>{render({orientation: 'vertical', isQuiet: true}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderBoth({orientation: 'vertical', isQuiet: true}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
        <div style={{flex: '1'}}>{renderIcons({orientation: 'vertical', isQuiet: true}, [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}])}</div>
      </Flex>
    </Flex>
  );
}
