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
import BookIcon from '@spectrum-icons/workflow/Book';
import CopyIcon from '@spectrum-icons/workflow/Copy';
import DeleteIcon from '@spectrum-icons/workflow/Delete';
import DocumentIcon from '@spectrum-icons/workflow/Document';
import DrawIcon from '@spectrum-icons/workflow/Draw';
import {Flex} from '@react-spectrum/layout';
import InfoIcon from '@spectrum-icons/workflow/Info';
import {Item} from '@react-stately/collections';
import PropertiesIcon from '@spectrum-icons/workflow/Properties';
import React from 'react';
import SettingsIcon from '@spectrum-icons/workflow/Settings';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/text';
import {Tooltip, TooltipTrigger} from '@react-spectrum/tooltip';
import ViewCardIcon from '@spectrum-icons/workflow/ViewCard';
import ViewGridIcon from '@spectrum-icons/workflow/ViewGrid';
import ViewListIcon from '@spectrum-icons/workflow/ViewList';

const docItems = [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}];
const editItems = [{children: 'Edit', name: '1'}, {children: 'Copy', name: '2'}, {children: 'Delete', name: '3'}];
const viewItems2 = [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}];
const viewItems = [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}];
const dataItems = [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}];
let onSelectionChange = action('onSelectionChange');

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

storiesOf('ActionGroup', module)
  .addParameters({providerSwitcher: {status: 'negative'}})
  .add(
    'default',
    () => (
      <Flex direction="column" gap="size-200" width="100%" margin="size-100">
        <ActionGroup onAction={action('onAction')}>
          {
            docItems.map((itemProps) => (
              <Item key={itemProps.name} textValue={itemProps.name} {...itemProps} />
            ))
          }
        </ActionGroup>
        <ActionGroup onAction={action('onAction')}>
          {
            docItems.map((itemProps) => {
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
        <ActionGroup onAction={action('onAction')}>
          {
            docItems.map((itemProps) => {
              let IconElement = iconMap[itemProps.children];
              return (
                <Item key={itemProps.name} textValue={itemProps.name} aria-label={itemProps.children}>
                  <IconElement />
                </Item>
              );
            })
          }
        </ActionGroup>
      </Flex>
    )
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true, defaultSelectedKeys: ['1']}, docItems)
  )
  .add(
    'compact',
    () => render({density: 'compact', defaultSelectedKeys: ['1']}, viewItems)
  )
  .add(
    'isJustified',
    () => render({isJustified: true, defaultSelectedKeys: ['1']}, viewItems2)
  )
  .add(
    'compact, isJustified',
    () => render({density: 'compact', isJustified: true, defaultSelectedKeys: ['1']}, viewItems2)
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true, defaultSelectedKeys: ['1']}, editItems)
  )
  .add(
    'compact, isQuiet',
    () => render({density: 'compact', isQuiet: true, defaultSelectedKeys: ['1']}, editItems)
  )
  .add(
    'isEmphasized',
    () => render({isEmphasized: true, defaultSelectedKeys: ['1']}, docItems)
  )
  .add(
    'compact, isEmphasized',
    () => render({isEmphasized: true, density: 'compact', defaultSelectedKeys: ['1']}, viewItems)
  )
  .add(
    'isQuiet, isEmphasized',
    () => render({isEmphasized: true, isQuiet: true, defaultSelectedKeys: ['1']}, viewItems)
  )
  .add(
    'selectionMode: multiple',
    () => render({selectionMode: 'multiple', defaultSelectedKeys: ['1', '2']}, dataItems)
  )
  .add(
    'selectionMode: single, disallowEmptySelection',
    () => render({selectionMode: 'single', disallowEmptySelection: true, defaultSelectedKeys: ['1']}, dataItems)
  )
  .add(
    'selectionMode: multiple, isQuiet',
    () => render({isQuiet: true, selectionMode: 'multiple', defaultSelectedKeys: ['1', '2']}, dataItems)
  )
  .add(
    'selectionMode: multiple, isQuiet, compact',
    () => render({isQuiet: true, density: 'compact', selectionMode: 'multiple', defaultSelectedKeys: ['1', '2']}, dataItems)
  )
  .add(
    'selectionMode: multiple, isEmphasized',
    () => render({isEmphasized: true, selectionMode: 'multiple', defaultSelectedKeys: ['1', '2']}, dataItems)
  )
  .add(
    'selectionMode: multiple, isEmphasized, compact',
    () => render({isEmphasized: true, density: 'compact', selectionMode: 'multiple', defaultSelectedKeys: ['1', '2']}, dataItems)
  )
  .add(
    'selectionMode: multiple, isEmphasized, isQuiet',
    () => render({isEmphasized: true, isQuiet: true, selectionMode: 'multiple', defaultSelectedKeys: ['1', '2']}, dataItems)
  )
  .add(
    'selectionMode: multiple, isEmphasized, isQuiet, compact',
    () => render({isEmphasized: true, isQuiet: true, density: 'compact', selectionMode: 'multiple', defaultSelectedKeys: ['1', '2']}, dataItems)
  )
  // no selection mode none, it's covered in the default story visually
  .add(
    'vertical',
    () => render({orientation: 'vertical', defaultSelectedKeys: ['1']}, docItems)
  )
  .add(
    'vertical, isJustified',
    () => render({isJustified: true, orientation: 'vertical', defaultSelectedKeys: ['1']}, docItems)
  )
  .add(
    'vertical, compact',
    () => render({density: 'compact', orientation: 'vertical', defaultSelectedKeys: ['1']}, viewItems)
  )
  .add(
    'vertical, isJustified, compact',
    () => render({isJustified: true, density: 'compact', orientation: 'vertical', defaultSelectedKeys: ['1']}, viewItems)
  )
  .add(
    'vertical, isQuiet',
    () => render({isQuiet: true, orientation: 'vertical', defaultSelectedKeys: ['1']}, editItems)
  )
  .add(
    'vertical, isQuiet, compact',
    () => render({isQuiet: true, density: 'compact', orientation: 'vertical', defaultSelectedKeys: ['1']}, viewItems)
  )
  .add(
    'disabledKeys',
    () => render({disabledKeys: ['1', '2'], selectionMode: 'multiple'}, dataItems)
  )
  .add(
    'dynamic default',
    () => (
      <ActionGroup onAction={action('onAction')} items={viewItems}>
        {item => <Item key={item.name} textValue={item.name}>{item.children}</Item>}
      </ActionGroup>
    )
  )
  .add(
    'dynamic single selection',
    () => (
      <ActionGroup selectionMode="single" onSelectionChange={s => onSelectionChange([...s])} items={viewItems}>
        {item => <Item key={item.name} textValue={item.name}>{item.children}</Item>}
      </ActionGroup>
    )
  )
  .add(
    'with tooltips',
    () => renderTooltips({})
  );


function render(props, items) {
  return (
    <Flex gap="size-300" margin="size-100" width="100%" direction="column">
      {renderText(props, items)}
      {renderBoth(props, items)}
      {renderIcons(props, items)}
    </Flex>
  );
}

function renderText(props, items: any = docItems) {
  return (
    <ActionGroup selectionMode="single" onSelectionChange={s => onSelectionChange([...s])} {...props}>
      {
        items.map((itemProps) => (
          <Item key={itemProps.name} textValue={itemProps.name} {...itemProps} />
        ))
      }
    </ActionGroup>
  );
}

function renderBoth(props, items: any = docItems) {
  return (
    <ActionGroup selectionMode="single" onSelectionChange={s => onSelectionChange([...s])} {...props}>
      {
        items.map((itemProps) => {
          let IconElement = iconMap[itemProps.children];
          return (
            <Item key={itemProps.name} textValue={itemProps.name} aria-label={itemProps.children}>
              <Text>{itemProps.children}</Text>
              <IconElement />
            </Item>
          );
        })
      }
    </ActionGroup>
  );
}

function renderIcons(props, items: any = docItems) {
  return (
    <ActionGroup selectionMode="single" onSelectionChange={s => onSelectionChange([...s])} {...props}>
      {
        items.map((itemProps) => {
          let IconElement = iconMap[itemProps.children];
          return (
            <Item key={itemProps.name} textValue={itemProps.name} aria-label={itemProps.children}>
              <IconElement />
            </Item>
          );
        })
      }
    </ActionGroup>
  );
}

function renderTooltips(props, items: any = docItems) {
  return (
    <ActionGroup selectionMode="single" onSelectionChange={s => onSelectionChange([...s])} {...props}>
      {
        items.map((itemProps) => {
          let IconElement = iconMap[itemProps.children];
          return (
            <TooltipTrigger>
              <Item key={itemProps.name} textValue={itemProps.children} aria-label={itemProps.children}>
                <IconElement />
              </Item>
              <Tooltip>{itemProps.children}</Tooltip>
            </TooltipTrigger>
          );
        })
      }
    </ActionGroup>
  );
}
