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
import {Avatar} from '@react-spectrum/avatar';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Heading, Text} from '@react-spectrum/text';
import {Item, SpectrumTagGroupProps, TagGroup} from '../src';
import {Link} from '@react-spectrum/link';
import React, {useState} from 'react';

let manyItems = [];
for (let i = 0; i < 50; i++) {
  let item = {key: i};
  manyItems.push(item);
}

function ResizableContainer({children}) {
  return (
    <div style={{width: '200px', height: '200px', padding: '10px', resize: 'horizontal', overflow: 'auto', backgroundColor: 'var(--spectrum-global-color-gray-50)'}}>
      {children}
      <p>Use the resize handle to resize the container.</p>
    </div>
  );
}

function render(props: SpectrumTagGroupProps<unknown>) {
  return (
    <TagGroup {...props} aria-label="Tag group">
      <Item key="1">Cool Tag 1</Item>
      <Item key="2">Cool Tag 2</Item>
      <Item key="3">Cool Tag 3</Item>
      <Item key="4">Cool Tag 4</Item>
      <Item key="5">Cool Tag 5</Item>
      <Item key="6">Cool Tag 6</Item>
    </TagGroup>
  );
}

export default {
  title: 'TagGroup',
  component: TagGroup,
  argTypes: {
    onRemove: {
      table: {
        disable: true
      }
    },
    onAction: {
      table: {
        disable: true
      }
    },
    items: {
      table: {
        disable: true
      }
    },
    maxRows: {
      type: 'number'
    },
    contextualHelp: {
      table: {
        disable: true
      }
    },
    isRequired: {
      control: 'boolean'
    },
    necessityIndicator: {
      control: 'select',
      options: ['icon', 'label']
    },
    labelPosition: {
      control: 'select',
      options: ['top', 'side']
    },
    labelAlign: {
      control: 'select',
      options: ['start', 'end']
    },
    validationState: {
      control: 'select',
      options: [null, 'valid', 'invalid']
    },
    description: {
      control: 'text'
    },
    errorMessage: {
      control: 'text'
    }
  },
  render: args => render(args)
} as ComponentMeta<typeof TagGroup>;

export type TagGroupStory = ComponentStoryObj<any>;

export const Default: TagGroupStory = {};

export const WithIcons: TagGroupStory = {
  args: {items: [{key: '1', label: 'Cool Tag 1'}, {key: '2', label: 'Cool Tag 2'}]},
  render: (args) => (
    <TagGroup aria-label="Tag group with icons" {...args}>
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
  name: 'onRemove'
};

export const Wrapping: TagGroupStory = {
  decorators: [(Story) => <ResizableContainer>{<Story />}</ResizableContainer>]
};

export const LabelTruncation: TagGroupStory = {
  render: (args) => (
    <div style={{width: '100px'}}>
      <TagGroup aria-label="Tag group with label truncation" {...args}>
        <Item key="1">Cool Tag 1 with a really long label</Item>
        <Item key="2">Another long cool tag label</Item>
        <Item key="3">This tag</Item>
      </TagGroup>
    </div>
  )
};

export const MaxRows: TagGroupStory = {
  args: {maxRows: 2},
  decorators: [(Story) => <ResizableContainer>{<Story />}</ResizableContainer>],
  name: 'maxRows'
};

export const MaxRowsManyTags: TagGroupStory = {
  args: {maxRows: 2},
  render: (args) => (
    <TagGroup aria-label="Tag group with 50 tags" items={manyItems} {...args}>
      {(item: any) => (
        <Item key={item.key}>{`Tag ${item.key}`}</Item>
      )}
    </TagGroup>
  ),
  decorators: [(Story) => <ResizableContainer>{<Story />}</ResizableContainer>],
  name: 'maxRows with many tags'
};

export const MaxRowsOnRemove: TagGroupStory = {
  args: {maxRows: 2},
  render: (args) => <OnRemoveExample {...args} />,
  decorators: [(Story) => <ResizableContainer>{<Story />}</ResizableContainer>],
  name: 'maxRows + onRemove'
};

export const WithAvatar: TagGroupStory = {
  args: {items: [{key: '1', label: 'Cool Person 1'}, {key: '2', label: 'Cool Person 2'}]},
  render: (args) => (
    <TagGroup aria-label="Tag group with avatars" {...args}>
      {(item: any) => (
        <Item key={item.key} textValue={item.label}>
          <Avatar src="https://i.imgur.com/kJOwAdv.png" alt="default Adobe avatar" />
          <Text>{item.label}</Text>
        </Item>
      )}
    </TagGroup>
  ),
  name: 'with avatar'
};

export const WithAvatarOnRemove: TagGroupStory = {
  render: (args) => <OnRemoveExample withAvatar {...args} />,
  name: 'with avatar + onRemove'
};

export const WithAction: TagGroupStory = {
  args: {onAction: action('clear'), actionLabel: 'Clear'},
  name: 'with action'
};

export const WithActionAndMaxRows: TagGroupStory = {
  args: {
    maxRows: 2,
    onAction: action('clear'),
    actionLabel: 'Clear'
  },
  decorators: [(Story) => <ResizableContainer>{<Story />}</ResizableContainer>],
  name: 'with action and maxRows'
};

export const WithLabelDescriptionContextualHelp: TagGroupStory = {
  args: {
    label: 'Some sample tags',
    description: 'Here is a description about the tag group.',
    contextualHelp: (
      <ContextualHelp>
        <Heading>What are these tags?</Heading>
        <Content>Here is more information about the tag group.</Content>
      </ContextualHelp>
    )
  },
  decorators: [(Story) => <ResizableContainer>{<Story />}</ResizableContainer>],
  name: 'with label, description, contextual help'
};

export const WithLabelDescriptionContextualHelpAndAction: TagGroupStory = {
  args: {
    onAction: action('clear'),
    actionLabel: 'Clear',
    label: 'Some sample tags',
    description: 'Here is a description about the tag group.',
    contextualHelp: (
      <ContextualHelp>
        <Heading>What are these tags?</Heading>
        <Content>Here is more information about the tag group.</Content>
      </ContextualHelp>
    )
  },
  decorators: [(Story) => <ResizableContainer>{<Story />}</ResizableContainer>],
  name: 'with label, description, contextual help + action'
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

function OnRemoveExample(props) {
  let {withAvatar, ...otherProps} = props;
  let [items, setItems] = useState([
    {id: 1, label: 'Cool Tag 1'},
    {id: 2, label: 'Another cool tag'},
    {id: 3, label: 'This tag'},
    {id: 4, label: 'What tag?'},
    {id: 5, label: 'This tag is cool too'},
    {id: 6, label: 'Shy tag'}
  ]);

  let onRemove = (key) => {
    setItems(prevItems => prevItems.filter((item) => key !== item.id));
    action('onRemove')(key);
  };

  return (
    <TagGroup allowsRemoving aria-label="Tag group with removable tags" items={items} onRemove={key => onRemove(key)} {...otherProps}>
      {(item: any) => (
        <Item key={item.key} textValue={item.label}>
          {withAvatar && <Avatar src="https://i.imgur.com/kJOwAdv.png" alt="default Adobe avatar" />}
          <Text>{item.label}</Text>
        </Item>
      )}
    </TagGroup>
  );
}
