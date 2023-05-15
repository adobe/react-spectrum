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

import Audio from '@spectrum-icons/workflow/Audio';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Item, TagGroup} from '../';
import {Link} from '@react-spectrum/link';
import React from 'react';
import {Text} from '@react-spectrum/text';

export type TagGroupStory = ComponentStoryObj<typeof TagGroup>;

export default {
  title: 'TagGroup',
  component: TagGroup
} as ComponentMeta<typeof TagGroup>;

let defaultItems = [
  {id: 1, label: 'Cool Tag 1'},
  {id: 2, label: 'Another cool tag'},
  {id: 3, label: 'This tag'},
  {id: 4, label: 'What tag?'},
  {id: 5, label: 'This tag is cool too'},
  {id: 6, label: 'Shy tag'}
];

export const Default: TagGroupStory = {
  render: (args) => (
    <TagGroup {...args} aria-label="Tag group">
      {(item: any) => (
        <Item key={item.key} textValue={item.label}>
          <Text>{item.label}</Text>
        </Item>
      )}
    </TagGroup>
  ),
  args: {
    items: defaultItems
  }
};

export const Removable: TagGroupStory = {
  ...Default,
  args: {
    items: defaultItems,
    allowsRemoving: true,
    label: 'Removable Tags'
  }
};

export const CustomAction: TagGroupStory = {
  ...Default,
  args: {
    items: defaultItems,
    allowsRemoving: true,
    actionLabel: 'Clear',
    description: 'Go ahead, clear them all.'
  }
};

export const WithIcon: TagGroupStory = {
  render: (args) => (
    <TagGroup {...args} aria-label="Tag group">
      {(item: any) => (
        <Item key={item.key} textValue={item.label}>
          <Audio />
          <Text>{item.label}</Text>
        </Item>
      )}
    </TagGroup>
  ),
  args: {
    items: defaultItems
  }
};

export const LabelWrapping: TagGroupStory = {
  ...Default,
  decorators: [
    (Story) => (
      <div style={{width: '100px'}}>
        <Story />
      </div>
    )
  ]
};

export const MaxRows: TagGroupStory = {
  ...Default,
  args: {
    items: defaultItems,
    maxRows: 2
  },
  decorators: [
    (Story) => (
      <div style={{width: '200px'}}>
        <Story />
      </div>
    )
  ]
};

export const MaxRowsCustomAction: TagGroupStory = {
  ...Default,
  args: {
    items: defaultItems,
    maxRows: 2,
    actionLabel: 'Clear'
  },
  decorators: [
    (Story) => (
      <div style={{width: '200px'}}>
        <Story />
      </div>
    )
  ]
};

export const EmptyState: TagGroupStory = {
  render: (args) => (
    <TagGroup label="Tag group with empty state" {...args}>
      {[]}
    </TagGroup>
  ),
  storyName: 'Empty state'
};

export const CustomEmptyState: TagGroupStory = {
  ...EmptyState,
  args: {
    renderEmptyState: () => <span>No tags. <Link><a href="//react-spectrum.com">Click here</a></Link> to add some.</span>
  },
  storyName: 'Custom empty state'
};
