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
import Audio from '@spectrum-icons/workflow/Audio';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Item, TagGroup} from '../src';
import React, {useState} from 'react';
import {TagGroupProps} from '@react-types/tag';
import {Text} from '@react-spectrum/text';

let manyItems = [];
for (let i = 0; i < 50; i++) {
  let item = {key: i};
  manyItems.push(item);
}

export default {
  title: 'TagGroup',
  component: TagGroup,
  args: {
    onRemove: action('onRemove')
  },
  argTypes: {
    onRemove: {
      table: {
        disable: true
      }
    },
    maxRows: {type: 'number'}
  }
} as ComponentMeta<typeof TagGroup>;

export type TagGroupStory = ComponentStoryObj<any>;

export const Default: TagGroupStory = {
  render: (args) => render(args)
};

function render(props: TagGroupProps<unknown>) {
  return (
    <TagGroup {...props} aria-label="tag group">
      <Item key="1">Cool Tag 1</Item>
      <Item key="2">Cool Tag 2</Item>
      <Item key="3">Cool Tag 3</Item>
    </TagGroup>
  );
}

export const WithIcons: TagGroupStory = {
  args: {items: [{key: '1', label: 'Cool Tag 1'}, {key: '2', label: 'Cool Tag 2'}]},
  render: (args) => (
    <TagGroup aria-label="tag group" {...args}>
      {(item: any) => (
        <Item key={item.key} textValue={item.label}>
          <Audio />
          <Text>{item.label}</Text>
        </Item>
      )}
    </TagGroup>
  )
};

export const OnRemove: TagGroupStory = {
  render: (args) => <OnRemoveExample {...args} />,
  storyName: 'onRemove'
};

export const Wrapping: TagGroupStory = {
  render: (args) => (
    <div style={{width: '200px', height: '200px', padding: '10px', resize: 'horizontal', overflow: 'auto', backgroundColor: 'var(--spectrum-global-color-gray-50)'}}>
      <TagGroup aria-label="tag group" {...args}>
        <Item key="1">Cool Tag 1</Item>
        <Item key="2">Another cool tag</Item>
        <Item key="3">This tag</Item>
        <Item key="4">What tag?</Item>
        <Item key="5">This tag is cool too</Item>
        <Item key="6">Shy tag</Item>
      </TagGroup>
    </div>
    )
};

export const LabelTruncation: TagGroupStory = {
  render: (args) => (
    <div style={{width: '100px'}}>
      <TagGroup aria-label="tag group" {...args}>
        <Item key="1">Cool Tag 1 with a really long label</Item>
        <Item key="2">Another long cool tag label</Item>
        <Item key="3">This tag</Item>
      </TagGroup>
    </div>
    )
};

export const MaxRows: TagGroupStory = {
  args: {maxRows: 2},
  render: (args) => (
    <div style={{width: '200px', height: '200px', padding: '10px', resize: 'horizontal', overflow: 'auto', backgroundColor: 'var(--spectrum-global-color-gray-50)'}}>
      <TagGroup width="100%" aria-label="tag group" {...args}>
        <Item key="1">Cool Tag 1</Item>
        <Item key="2">Another cool tag</Item>
        <Item key="3">This tag</Item>
        <Item key="4">What tag?</Item>
        <Item key="5">This tag is cool too</Item>
        <Item key="6">Shy tag</Item>
      </TagGroup>
    </div>
    ),
  storyName: 'maxRows'
};

export const MaxRowsManyTags: TagGroupStory = {
  args: {maxRows: 2},
  render: (args) => (
    <div style={{width: '200px', height: '200px', padding: '10px', resize: 'horizontal', overflow: 'auto', backgroundColor: 'var(--spectrum-global-color-gray-50)'}}>
      <TagGroup width="100%" aria-label="tag group" items={manyItems} {...args}>
        {(item: any) => (
          <Item key={item.key}>{`Tag ${item.key}`}</Item>
        )}
      </TagGroup>
    </div>
    ),
  storyName: 'maxRows with many tags'
};

function OnRemoveExample() {
  let [items, setItems] = useState([
    {key: 1, label: 'Cool Tag 1'},
    {key: 2, label: 'Another cool tag'},
    {key: 3, label: 'This tag'},
    {key: 4, label: 'What tag?'},
    {key: 5, label: 'This tag is cool too'},
    {key: 6, label: 'Shy tag'}
  ]);
  let onRemove = (key) => {
    const newItems = [...items].filter((item) => key !== item.key.toString());
    setItems(newItems);
    action('onRemove')(key);
  };

  return (
    <TagGroup allowsRemoving aria-label="tag group" items={items} onRemove={key => onRemove(key)}>
      {item => (
        <Item key={item.key}>{item.label}</Item>
      )}
    </TagGroup>
  );
}

