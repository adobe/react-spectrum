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

import {ActionGroup, SpectrumActionGroupProps} from '../';
import BookIcon from '@spectrum-icons/workflow/Book';
import CopyIcon from '@spectrum-icons/workflow/Copy';
import DeleteIcon from '@spectrum-icons/workflow/Delete';
import DocumentIcon from '@spectrum-icons/workflow/Document';
import DrawIcon from '@spectrum-icons/workflow/Draw';
import {Flex} from '@react-spectrum/layout';
import InfoIcon from '@spectrum-icons/workflow/Info';
import {Item} from '@react-stately/collections';
import {Meta, StoryObj} from '@storybook/react';
import PropertiesIcon from '@spectrum-icons/workflow/Properties';
import React, {JSX} from 'react';
import SettingsIcon from '@spectrum-icons/workflow/Settings';
import {Text} from '@react-spectrum/text';
import {View} from '@react-spectrum/view';
import ViewCardIcon from '@spectrum-icons/workflow/ViewCard';
import ViewGridIcon from '@spectrum-icons/workflow/ViewGrid';
import ViewListIcon from '@spectrum-icons/workflow/ViewList';

export const docItems = [{children: 'Document setup', name: '1'}, {children: 'Settings', name: '2'}] as const;
export const editItems = [{children: 'Edit', name: '1'}, {children: 'Copy', name: '2'}, {children: 'Delete', name: '3'}] as const;
export const viewItems2 = [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}] as const;
export const viewItems = [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}] as const;
export const dataItems = [{children: 'Properties', name: '1'}, {children: 'Info', name: '2'}, {children: 'Keywords', name: '3'}] as const;

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
  title: 'ActionGroup',
  excludeStories: ['Render', 'RenderText', 'RenderBoth', 'RenderIcons', 'docItems', 'editItems', 'viewItems2', 'viewItems', 'dataItems']
} as Meta<typeof ActionGroup>;

export type ActionGroupStory = StoryObj<typeof Render>;

export const Default: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: docItems
  },
  name: 'default'
};

export const IsDisabled: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: docItems,
    isDisabled: true,
    defaultSelectedKeys: ['1']
  },
  name: 'isDisabled'
};

export const Compact: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: viewItems,
    density: 'compact',
    defaultSelectedKeys: ['1']
  },
  name: 'compact'
};

export const IsJustified: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: viewItems2,
    isJustified: true,
    defaultSelectedKeys: ['1']
  },
  name: 'isJustified'
};

export const CompactIsJustified: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: viewItems2,
    density: 'compact',
    isJustified: true,
    defaultSelectedKeys: ['1']
  },
  name: 'compact, isJustified'
};

export const IsQuiet: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: editItems,
    isQuiet: true,
    defaultSelectedKeys: ['1']
  },
  name: 'isQuiet'
};

export const CompactIsQuiet: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: editItems,
    density: 'compact',
    isQuiet: true,
    defaultSelectedKeys: ['1']
  },
  name: 'compact, isQuiet'
};

export const IsEmphasized: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: docItems,
    isEmphasized: true,
    defaultSelectedKeys: ['1']
  },
  name: 'isEmphasized'
};

export const CompactIsEmphasized: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: viewItems,
    isEmphasized: true,
    density: 'compact',
    defaultSelectedKeys: ['1']
  },
  name: 'compact, isEmphasized'
};

export const IsQuietIsEmphasized: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: viewItems,
    isEmphasized: true,
    isQuiet: true,
    defaultSelectedKeys: ['1']
  },
  name: 'isQuiet, isEmphasized'
};

export const SelectionModeMultiple: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: dataItems,
    selectionMode: 'multiple',
    defaultSelectedKeys: ['1', '2']
  },
  name: 'selectionMode: multiple'
};

export const StaticColorWhite: ActionGroupStory = {
  render: (args) => (
    <View backgroundColor="static-blue-700" padding="size-1000">
      <Render {...args} />
    </View>
  ),
  args: {
    items: viewItems,
    staticColor: 'white',
    defaultSelectedKeys: ['1']
  },
  name: 'staticColor=white'
};

export const StaticColorWhiteIsQuiet: ActionGroupStory = {
  render: (args) => (
    <View backgroundColor="static-blue-700" padding="size-1000">
      <Render {...args} />
    </View>
  ),
  args: {
    items: viewItems,
    staticColor: 'white',
    isQuiet: true,
    defaultSelectedKeys: ['1']
  },
  name: 'staticColor=white, isQuiet'
};

export const StaticColorBlack: ActionGroupStory = {
  render: (args) => (
    <View backgroundColor="static-yellow-400" padding="size-1000">
      <Render {...args} />
    </View>
  ),
  args: {
    items: viewItems,
    staticColor: 'black',
    defaultSelectedKeys: ['1']
  },
  name: 'staticColor=black'
};

export const StaticColorBlackIsQuiet: ActionGroupStory = {
  render: (args) => (
    <View backgroundColor="static-yellow-400" padding="size-1000">
      <Render {...args} />
    </View>
  ),
  args: {
    items: viewItems,
    staticColor: 'black',
    isQuiet: true,
    defaultSelectedKeys: ['1']
  },
  name: 'staticColor=black, isQuiet'
};

export const SelectionModeSingleDisallowEmptySelection: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: dataItems,
    selectionMode: 'single',
    disallowEmptySelection: true,
    defaultSelectedKeys: ['1']
  },
  name: 'selectionMode: single, disallowEmptySelection'
};

export const SelectionModeMultipleIsQuiet: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: dataItems,
    isQuiet: true,
    selectionMode: 'multiple',
    defaultSelectedKeys: ['1', '2']
  },
  name: 'selectionMode: multiple, isQuiet'
};

export const SelectionModeMultipleIsQuietCompact: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: dataItems,
    isQuiet: true,
    density: 'compact',
    selectionMode: 'multiple',
    defaultSelectedKeys: ['1', '2']
  },
  name: 'selectionMode: multiple, isQuiet, compact'
};

export const SelectionModeMultipleIsEmphasized: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: dataItems,
    isEmphasized: true,
    selectionMode: 'multiple',
    defaultSelectedKeys: ['1', '2']
  },
  name: 'selectionMode: multiple, isEmphasized'
};

export const SelectionModeMultipleIsEmphasizedCompact: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: dataItems,
    isEmphasized: true,
    density: 'compact',
    selectionMode: 'multiple',
    defaultSelectedKeys: ['1', '2']
  },
  name: 'selectionMode: multiple, isEmphasized, compact'
};

export const SelectionModeMultipleIsEmphasizedIsQuiet: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: dataItems,
    isEmphasized: true,
    isQuiet: true,
    selectionMode: 'multiple',
    defaultSelectedKeys: ['1', '2']
  },
  name: 'selectionMode: multiple, isEmphasized, isQuiet'
};

export const SelectionModeMultipleIsEmphasizedIsQuietCompact: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: dataItems,
    isEmphasized: true,
    isQuiet: true,
    density: 'compact',
    selectionMode: 'multiple',
    defaultSelectedKeys: ['1', '2']
  },
  name: 'selectionMode: multiple, isEmphasized, isQuiet, compact'
};

export const SelectionModeNone: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: editItems,
    selectionMode: 'none'
  },
  name: 'selectionMode: none'
};

export const Vertical: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: docItems,
    orientation: 'vertical',
    defaultSelectedKeys: ['1']
  },
  name: 'vertical'
};

export const VerticalIsJustified: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: docItems,
    isJustified: true,
    orientation: 'vertical',
    defaultSelectedKeys: ['1']
  },
  name: 'vertical, isJustified'
};

export const VerticalCompact: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: viewItems,
    density: 'compact',
    orientation: 'vertical',
    defaultSelectedKeys: ['1']
  },
  name: 'vertical, compact'
};

export const VerticalIsJustifiedCompact: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: viewItems,
    isJustified: true,
    density: 'compact',
    orientation: 'vertical',
    defaultSelectedKeys: ['1']
  },
  name: 'vertical, isJustified, compact'
};

export const VerticalIsQuiet: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: editItems,
    isQuiet: true,
    orientation: 'vertical',
    defaultSelectedKeys: ['1']
  },
  name: 'vertical, isQuiet'
};

export const VerticalIsQuietCompact: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: viewItems,
    isQuiet: true,
    density: 'compact',
    orientation: 'vertical',
    defaultSelectedKeys: ['1']
  },
  name: 'vertical, isQuiet, compact'
};

export const DisabledKeys: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: dataItems,
    disabledKeys: ['1', '2'],
    selectionMode: 'multiple'
  },
  name: 'disabledKeys'
};

export const OverflowAndHide: ActionGroupStory = {
  render: (args) => <Render {...args} />,
  args: {
    items: dataItems,
    overflowMode: 'collapse',
    buttonLabelBehavior: 'hide',
    selectionMode: 'multiple'
  },
  name: 'overflowMode: collapse, buttonLabelBehavior: hide'
};

export function Render(props: Omit<SpectrumActionGroupProps<unknown>, 'children'> & {items: any}): JSX.Element {
  return (
    <Flex rowGap="size-300" margin="size-100" width="100%" direction="column">
      <RenderText {...props} />
      <RenderBoth {...props} />
      <RenderIcons {...props} />
    </Flex>
  );
}

export function RenderText(props: Omit<SpectrumActionGroupProps<unknown>, 'children'> & {items: any}): JSX.Element {
  let {items} = props;
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

export function RenderBoth(props: Omit<SpectrumActionGroupProps<unknown>, 'children'> & {items: any}): JSX.Element {
  let {items = docItems} = props;
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

export function RenderIcons(props: Omit<SpectrumActionGroupProps<unknown>, 'children'> & {items: any}): JSX.Element {
  let {items = docItems} = props;
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
