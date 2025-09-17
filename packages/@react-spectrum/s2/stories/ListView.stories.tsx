/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton, ActionButtonGroup, Image, ListView, ListViewItem, Text} from '../';
import {categorizeArgTypes} from './utils';
import Delete from '../s2wf-icons/S2_Icon_Delete_20_N.svg';
import Edit from '../s2wf-icons/S2_Icon_Edit_20_N.svg';
import File from '../s2wf-icons/S2_Icon_File_20_N.svg';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import {Key} from 'react-aria';
import type {Meta, StoryObj} from '@storybook/react';
import {ReactNode} from 'react';

const meta: Meta<typeof ListView> = {
  component: ListView,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', ['onSelectionChange'])
  },
  title: 'ListView',
  decorators: [
    (Story) => (
      <div style={{width: '300px', resize: 'both', height: '320px'}}>
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof ListView>;

export const Example: Story = {
  args: {
    'aria-label': 'Birthday',
    children: (
      <>
        <ListViewItem>
          <Text>Item 1</Text>
        </ListViewItem>
        <ListViewItem>
          <Text>Item 2</Text>
        </ListViewItem>
        <ListViewItem>
          <Text>Item 3</Text>
        </ListViewItem>
      </>
    )
  }
};

interface Item {
  id: Key,
  name: string,
  type?: 'file' | 'folder',
  children?: Item[]
}

const items: Item[] = [
  {id: 'a', name: 'Adobe Photoshop', type: 'file'},
  {id: 'b', name: 'Adobe XD', type: 'file'},
  {id: 'c', name: 'Documents', type: 'folder', children: [
    {id: 1, name: 'Sales Pitch'},
    {id: 2, name: 'Demo'},
    {id: 3, name: 'Taxes'}
  ]},
  {id: 'd', name: 'Adobe InDesign', type: 'file'},
  {id: 'e', name: 'Utilities', type: 'folder', children: [
    {id: 1, name: 'Activity Monitor'}
  ]},
  {id: 'f', name: 'Adobe AfterEffects', type: 'file'},
  {id: 'g', name: 'Adobe Illustrator', type: 'file'},
  {id: 'h', name: 'Adobe Lightroom', type: 'file'},
  {id: 'i', name: 'Adobe Premiere Pro', type: 'file'},
  {id: 'j', name: 'Adobe Fresco', type: 'file'},
  {id: 'k', name: 'Adobe Dreamweaver', type: 'file'},
  {id: 'l', name: 'Adobe Connect', type: 'file'},
  {id: 'm', name: 'Pictures', type: 'folder', children: [
    {id: 1, name: 'Yosemite'},
    {id: 2, name: 'Jackson Hole'},
    {id: 3, name: 'Crater Lake'}
  ]},
  {id: 'n', name: 'Adobe Acrobat', type: 'file'}
];

export const Dynamic: Story = {
  render: (args) => (
    <ListView {...args} items={items}>
      {(item) => (
        <ListViewItem>{item.name}</ListViewItem>
      )}
    </ListView>
  ),
  args: {
    'aria-label': 'Birthday'
  }
};


// taken from https://random.dog/
const itemsWithThumbs: Array<{id: string, title: string, url: string}> = [
  {id: '1', title: 'swimmer', url: 'https://random.dog/b2fe2172-cf11-43f4-9c7f-29bd19601712.jpg'},
  {id: '2', title: 'chocolate', url: 'https://random.dog/2032518a-eec8-4102-9d48-3dca5a26eb23.png'},
  {id: '3', title: 'good boi', url: 'https://random.dog/191091b2-7d69-47af-9f52-6605063f1a47.jpg'},
  {id: '4', title: 'polar bear', url: 'https://random.dog/c22c077e-a009-486f-834c-a19edcc36a17.jpg'},
  {id: '5', title: 'cold boi', url: 'https://random.dog/093a41da-e2c0-4535-a366-9ef3f2013f73.jpg'},
  {id: '6', title: 'pilot', url: 'https://random.dog/09f8ecf4-c22b-49f4-af24-29fb5c8dbb2d.jpg'},
  {id: '7', title: 'nerd', url: 'https://random.dog/1a0535a6-ca89-4059-9b3a-04a554c0587b.jpg'},
  {id: '8', title: 'audiophile', url: 'https://random.dog/32367-2062-4347.jpg'}
];

export const DynamicWithThumbs: Story = {
  render: (args) => (
    <ListView {...args} items={itemsWithThumbs}>
      {item => (
        <ListViewItem>
          <Text>{item.title}</Text>
          {item.url ? <Image src={item.url} alt={item.title} /> : null}
        </ListViewItem>
      )}
    </ListView>
  ),
  args: {
    'aria-label': 'Birthday'
  }
};


// taken from https://random.dog/
const itemsWithIcons: Array<{id: string, title: string, icons: ReactNode}> = [
  {id: '0', title: 'folder of good bois', icons: <Folder />},
  {id: '1', title: 'swimmer', icons: <File />},
  {id: '2', title: 'chocolate', icons: <File />},
  {id: '3', title: 'good boi', icons: <File />},
  {id: '4', title: 'polar bear', icons: <File />},
  {id: '5', title: 'cold boi', icons: <File />},
  {id: '6', title: 'pilot', icons: <File />},
  {id: '8', title: 'audiophile', icons: <File />},
  {id: '9', title: 'file of great boi', icons: <File />},
  {id: '10', title: 'fuzzy boi', icons: <File />},
  {id: '11', title: 'i know what i am doing', icons: <File />},
  {id: '12', title: 'kisses', icons: <File />},
  {id: '13', title: 'belly rubs', icons: <File />},
  {id: '14', title: 'long boi', icons: <File />},
  {id: '15', title: 'floof', icons: <File />},
  {id: '16', title: 'german sheparpadom', icons: <File />}
];

export const DynamicWithIcon: Story = {
  render: (args) => (
    <ListView {...args} items={itemsWithIcons}>
      {item => (
        <ListViewItem>
          <Text>{item.title}</Text>
          {item.icons ? item.icons : null}
          <ActionButtonGroup>
            <ActionButton aria-label="Edit"><Edit /></ActionButton>
            <ActionButton aria-label="Delete"><Delete /></ActionButton>
          </ActionButtonGroup>
        </ListViewItem>
      )}
    </ListView>
  ),
  args: {
    'aria-label': 'Birthday'
  }
};
