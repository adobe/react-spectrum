/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton, ActionButtonGroup, ActionMenu, Content, Heading, IllustratedMessage, ListView, ListViewItem, MenuItem, Text} from '../src';
import Delete from '../s2wf-icons/S2_Icon_Delete_20_N.svg';
import Edit from '../s2wf-icons/S2_Icon_Edit_20_N.svg';
import File from '../s2wf-icons/S2_Icon_File_20_N.svg';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import FolderOpen from '../spectrum-illustrations/linear/FolderOpen';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof ListView> = {
  component: ListView,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/ListView'
};

export default meta;
type Story = StoryObj<typeof ListView>;

let listViewStyles = style({width: 320, height: 320});

const items = [
  {id: 'utilities', name: 'Utilities', type: 'folder', description: '16 items'},
  {id: 'photoshop', name: 'Adobe Photoshop', type: 'file', description: 'Application'},
  {id: 'illustrator', name: 'Adobe Illustrator', type: 'file', description: 'Application'},
  {id: 'xd', name: 'Adobe XD', type: 'file', description: 'Application'}
];

export const Example: Story = {
  render: (args) => (
    <ListView {...args} aria-label="Files" styles={listViewStyles}>
      <ListViewItem id="utilities" textValue="Utilities" hasChildItems>
        <Folder />
        <Text>Utilities</Text>
        <Text slot="description">16 items</Text>
      </ListViewItem>
      <ListViewItem id="photoshop">Adobe Photoshop</ListViewItem>
      <ListViewItem id="illustrator">Adobe Illustrator</ListViewItem>
      <ListViewItem id="xd">Adobe XD</ListViewItem>
    </ListView>
  ),
  args: {
    selectionMode: 'multiple',
    onLoadMore: undefined
  }
};

export const HighlightSelection: Story = {
  ...Example,
  args: {
    ...Example.args,
    selectionStyle: 'highlight',
    selectedKeys: ['photoshop', 'illustrator']
  }
};

export const Quiet: Story = {
  ...Example,
  args: {
    ...Example.args,
    isQuiet: true
  }
};

export const OverflowTruncate: Story = {
  render: (args) => (
    <ListView {...args} aria-label="Long text examples" styles={listViewStyles}>
      <ListViewItem id="a">
        This is a very very very very very very very very long title.
      </ListViewItem>
      <ListViewItem id="b" textValue="Short title, long description">
        <Text>Short title</Text>
        <Text slot="description">This is a very very very very very very very very long description.</Text>
      </ListViewItem>
      <ListViewItem id="c" textValue="Long title, long description">
        <Text>This is a very very very very very very very very long title.</Text>
        <Text slot="description">This is a very very very very very very very very long description.</Text>
      </ListViewItem>
    </ListView>
  ),
  args: {
    ...Example.args,
    overflowMode: 'truncate'
  }
};

export const OverflowWrap: Story = {
  render: (args) => (
    <ListView {...args} aria-label="Long text examples" styles={listViewStyles}>
      <ListViewItem id="a">
        This is a very very very very very very very very long title.
      </ListViewItem>
      <ListViewItem id="b" textValue="Short title, long description">
        <Text>Short title</Text>
        <Text slot="description">This is a very very very very very very very very long description.</Text>
      </ListViewItem>
      <ListViewItem id="c" textValue="Long title, long description">
        <Text>This is a very very very very very very very very long title.</Text>
        <Text slot="description">This is a very very very very very very very very long description.</Text>
      </ListViewItem>
    </ListView>
  ),
  args: {
    ...Example.args,
    overflowMode: 'wrap'
  }
};

export const DisabledItems: Story = {
  render: (args) => (
    <ListView {...args} aria-label="Files" items={items} styles={listViewStyles} selectionMode="multiple" disabledKeys={['utilities', 'illustrator']}>
      {(item) => (
        <ListViewItem textValue={item.name} hasChildItems={item.type === 'folder'}>
          {item.type === 'folder' ? <Folder /> : <File />}
          <Text>{item.name}</Text>
          <Text slot="description">{item.description}</Text>
        </ListViewItem>
      )}
    </ListView>
  )
};

export const DisabledBehaviorSelection: Story = {
  ...DisabledItems,
  args: {
    disabledBehavior: 'selection'
  }
};

export const WithActions: Story = {
  render: (args) => (
    <ListView {...args} aria-label="Files" styles={listViewStyles}>
      <ListViewItem id="utilities" textValue="Utilities" hasChildItems>
        <Folder />
        <Text>Utilities</Text>
        <Text slot="description">16 items</Text>
        <ActionButtonGroup>
          <ActionButton aria-label="Edit"><Edit /></ActionButton>
        </ActionButtonGroup>
        <ActionMenu>
          <MenuItem id="edit"><Edit /><Text>Edit</Text></MenuItem>
          <MenuItem id="delete"><Delete /><Text>Delete</Text></MenuItem>
        </ActionMenu>
      </ListViewItem>
      <ListViewItem id="photoshop" textValue="Adobe Photoshop">
        <Text>Adobe Photoshop</Text>
        <Text slot="description">Application</Text>
        <ActionButtonGroup>
          <ActionButton aria-label="Edit"><Edit /></ActionButton>
        </ActionButtonGroup>
        <ActionMenu>
          <MenuItem id="edit"><Edit /><Text>Edit</Text></MenuItem>
          <MenuItem id="delete"><Delete /><Text>Delete</Text></MenuItem>
        </ActionMenu>
      </ListViewItem>
    </ListView>
  ),
  args: {
    selectionMode: 'single'
  }
};

export const EmptyState: Story = {
  render: (args) => (
    <ListView
      {...args}
      aria-label="Empty list"
      styles={listViewStyles}
      renderEmptyState={() => (
        <IllustratedMessage>
          <FolderOpen />
          <Heading>No results</Heading>
          <Content>No results found.</Content>
        </IllustratedMessage>
      )}>
      {[]}
    </ListView>
  )
};
