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
import {Text} from '@react-spectrum/text';
import {View} from '@react-spectrum/view';
import ViewCardIcon from '@spectrum-icons/workflow/ViewCard';
import ViewGridIcon from '@spectrum-icons/workflow/ViewGrid';
import ViewListIcon from '@spectrum-icons/workflow/ViewList';

const docItems = [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}];
const editItems = [{children: 'Edit', name: '1'}, {children: 'Copy', name: '2'}, {children: 'Delete', name: '3'}];
const viewItems2 = [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}];
const viewItems = [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}];
const dataItems = [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}];

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

export default {
  title: 'ActionGroup'
};

export const Default = () => render({}, docItems);

Default.story = {
  name: 'default'
};

export const IsDisabled = () => render({isDisabled: true, defaultSelectedKeys: ['1']}, docItems);

IsDisabled.story = {
  name: 'isDisabled'
};

export const Compact = () => render({density: 'compact', defaultSelectedKeys: ['1']}, viewItems);

Compact.story = {
  name: 'compact'
};

export const IsJustified = () =>
  render({isJustified: true, defaultSelectedKeys: ['1']}, viewItems2);

IsJustified.story = {
  name: 'isJustified'
};

export const CompactIsJustified = () =>
  render({density: 'compact', isJustified: true, defaultSelectedKeys: ['1']}, viewItems2);

CompactIsJustified.story = {
  name: 'compact, isJustified'
};

export const IsQuiet = () => render({isQuiet: true, defaultSelectedKeys: ['1']}, editItems);

IsQuiet.story = {
  name: 'isQuiet'
};

export const CompactIsQuiet = () =>
  render({density: 'compact', isQuiet: true, defaultSelectedKeys: ['1']}, editItems);

CompactIsQuiet.story = {
  name: 'compact, isQuiet'
};

export const IsEmphasized = () =>
  render({isEmphasized: true, defaultSelectedKeys: ['1']}, docItems);

IsEmphasized.story = {
  name: 'isEmphasized'
};

export const CompactIsEmphasized = () =>
  render({isEmphasized: true, density: 'compact', defaultSelectedKeys: ['1']}, viewItems);

CompactIsEmphasized.story = {
  name: 'compact, isEmphasized'
};

export const IsQuietIsEmphasized = () =>
  render({isEmphasized: true, isQuiet: true, defaultSelectedKeys: ['1']}, viewItems);

IsQuietIsEmphasized.story = {
  name: 'isQuiet, isEmphasized'
};

export const SelectionModeMultiple = () =>
  render({selectionMode: 'multiple', defaultSelectedKeys: ['1', '2']}, dataItems);

SelectionModeMultiple.story = {
  name: 'selectionMode: multiple'
};

export const StaticColorWhite = () => (
  <View backgroundColor="static-blue-700" padding="size-1000">
    {render({staticColor: 'white', defaultSelectedKeys: ['1']}, viewItems)}
  </View>
);

StaticColorWhite.story = {
  name: 'staticColor=white'
};

export const StaticColorWhiteIsQuiet = () => (
  <View backgroundColor="static-blue-700" padding="size-1000">
    {render({staticColor: 'white', isQuiet: true, defaultSelectedKeys: ['1']}, viewItems)}
  </View>
);

StaticColorWhiteIsQuiet.story = {
  name: 'staticColor=white, isQuiet'
};

export const StaticColorBlack = () => (
  <View backgroundColor="static-yellow-400" padding="size-1000">
    {render({staticColor: 'black', defaultSelectedKeys: ['1']}, viewItems)}
  </View>
);

StaticColorBlack.story = {
  name: 'staticColor=black'
};

export const StaticColorBlackIsQuiet = () => (
  <View backgroundColor="static-yellow-400" padding="size-1000">
    {render({staticColor: 'black', isQuiet: true, defaultSelectedKeys: ['1']}, viewItems)}
  </View>
);

StaticColorBlackIsQuiet.story = {
  name: 'staticColor=black, isQuiet'
};

export const SelectionModeSingleDisallowEmptySelection = () =>
  render(
    {selectionMode: 'single', disallowEmptySelection: true, defaultSelectedKeys: ['1']},
    dataItems
  );

SelectionModeSingleDisallowEmptySelection.story = {
  name: 'selectionMode: single, disallowEmptySelection'
};

export const SelectionModeMultipleIsQuiet = () =>
  render({isQuiet: true, selectionMode: 'multiple', defaultSelectedKeys: ['1', '2']}, dataItems);

SelectionModeMultipleIsQuiet.story = {
  name: 'selectionMode: multiple, isQuiet'
};

export const SelectionModeMultipleIsQuietCompact = () =>
  render(
    {
      isQuiet: true,
      density: 'compact',
      selectionMode: 'multiple',
      defaultSelectedKeys: ['1', '2']
    },
    dataItems
  );

SelectionModeMultipleIsQuietCompact.story = {
  name: 'selectionMode: multiple, isQuiet, compact'
};

export const SelectionModeMultipleIsEmphasized = () =>
  render(
    {isEmphasized: true, selectionMode: 'multiple', defaultSelectedKeys: ['1', '2']},
    dataItems
  );

SelectionModeMultipleIsEmphasized.story = {
  name: 'selectionMode: multiple, isEmphasized'
};

export const SelectionModeMultipleIsEmphasizedCompact = () =>
  render(
    {
      isEmphasized: true,
      density: 'compact',
      selectionMode: 'multiple',
      defaultSelectedKeys: ['1', '2']
    },
    dataItems
  );

SelectionModeMultipleIsEmphasizedCompact.story = {
  name: 'selectionMode: multiple, isEmphasized, compact'
};

export const SelectionModeMultipleIsEmphasizedIsQuiet = () =>
  render(
    {
      isEmphasized: true,
      isQuiet: true,
      selectionMode: 'multiple',
      defaultSelectedKeys: ['1', '2']
    },
    dataItems
  );

SelectionModeMultipleIsEmphasizedIsQuiet.story = {
  name: 'selectionMode: multiple, isEmphasized, isQuiet'
};

export const SelectionModeMultipleIsEmphasizedIsQuietCompact = () =>
  render(
    {
      isEmphasized: true,
      isQuiet: true,
      density: 'compact',
      selectionMode: 'multiple',
      defaultSelectedKeys: ['1', '2']
    },
    dataItems
  );

SelectionModeMultipleIsEmphasizedIsQuietCompact.story = {
  name: 'selectionMode: multiple, isEmphasized, isQuiet, compact'
};

export const SelectionModeNone = () => render({selectionMode: 'none'}, editItems);

SelectionModeNone.story = {
  name: 'selectionMode: none'
};

export const Vertical = () =>
  render({orientation: 'vertical', defaultSelectedKeys: ['1']}, docItems);

Vertical.story = {
  name: 'vertical'
};

export const VerticalIsJustified = () =>
  render({isJustified: true, orientation: 'vertical', defaultSelectedKeys: ['1']}, docItems);

VerticalIsJustified.story = {
  name: 'vertical, isJustified'
};

export const VerticalCompact = () =>
  render({density: 'compact', orientation: 'vertical', defaultSelectedKeys: ['1']}, viewItems);

VerticalCompact.story = {
  name: 'vertical, compact'
};

export const VerticalIsJustifiedCompact = () =>
  render(
    {isJustified: true, density: 'compact', orientation: 'vertical', defaultSelectedKeys: ['1']},
    viewItems
  );

VerticalIsJustifiedCompact.story = {
  name: 'vertical, isJustified, compact'
};

export const VerticalIsQuiet = () =>
  render({isQuiet: true, orientation: 'vertical', defaultSelectedKeys: ['1']}, editItems);

VerticalIsQuiet.story = {
  name: 'vertical, isQuiet'
};

export const VerticalIsQuietCompact = () =>
  render(
    {isQuiet: true, density: 'compact', orientation: 'vertical', defaultSelectedKeys: ['1']},
    viewItems
  );

VerticalIsQuietCompact.story = {
  name: 'vertical, isQuiet, compact'
};

export const DisabledKeys = () =>
  render({disabledKeys: ['1', '2'], selectionMode: 'multiple'}, dataItems);

DisabledKeys.story = {
  name: 'disabledKeys'
};

export const OverflowAndHide = () =>
  render({overflowMode: 'collapse', buttonLabelBehavior: 'hide', selectionMode: 'multiple'}, dataItems);

OverflowAndHide.story = {
  name: 'overflowMode: collapse, buttonLabelBehavior: hide'
};

function render(props, items) {
  return (
    <Flex rowGap="size-300" margin="size-100" width="100%" direction="column">
      {renderText(props, items)}
      {renderBoth(props, items)}
      {renderIcons(props, items)}
    </Flex>
  );
}

function renderText(props, items: any = docItems) {
  return (
    <ActionGroup selectionMode="single" {...props}>
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
    <ActionGroup selectionMode="single" {...props}>
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

function renderIcons(props, items: any = docItems) {
  return (
    <ActionGroup selectionMode="single" {...props}>
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
