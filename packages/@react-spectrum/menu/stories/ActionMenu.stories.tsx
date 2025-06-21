/*
 * Copyright 2021 Adobe. All rights reserved.
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
import {ActionMenu} from '..';
import {Alignment} from '@react-types/shared';
import {Checkbox} from '@react-spectrum/checkbox';
import {Flex} from '@react-spectrum/layout';
import {Item} from '../';
import {Meta, StoryFn, StoryObj} from '@storybook/react';
import {Picker} from '@react-spectrum/picker';
import React, {JSX, useState} from 'react';
import {SpectrumActionMenuProps} from '@react-types/menu';
import {Tooltip, TooltipTrigger} from '@react-spectrum/tooltip';

const meta: Meta<SpectrumActionMenuProps<object>> = {
  title: 'ActionMenu',
  component: ActionMenu
};

export default meta;

const Template = (args: Omit<SpectrumActionMenuProps<object>, 'children'>): JSX.Element => (
  <ActionMenu onAction={action('action')} {...args}>
    <Item key="one">One</Item>
    <Item key="two">Two</Item>
    <Item key="three">Three</Item>
  </ActionMenu>
);

type Direction = 'bottom' | 'top' | 'left' | 'right' | 'start' | 'end';
const directionItems = [
  {
    key: 'bottom',
    label: 'Bottom'
  },
  {
    key: 'top',
    label: 'Top'
  },
  {
    key: 'left',
    label: 'Left'
  },
  {
    key: 'right',
    label: 'Right'
  },
  {
    key: 'start',
    label: 'Start'
  },
  {
    key: 'end',
    label: 'End'
  }];
const alignItems = [
  {
    key: 'start',
    label: 'Start'
  },
  {
    key: 'end',
    label: 'End'
  }
];

function isOfDirection(key: string): key is Direction {
  return directionItems.map(e => e.key).includes(key);
}

function isOfAlignment(key: string): key is Alignment {
  return alignItems.map(e => e.key).includes(key);
}

function DirectionAlignment() {
  const [align, setAlignment] = useState<Alignment>('start');
  const [direction, setDirection] = useState<Direction>('bottom');
  const [shouldFlip, setShouldFlip] = useState(true);

  const handleAlignChange = (key) => {
    if (isOfAlignment(key)) {
      setAlignment(key);
    }
  };

  const handleDirectionChange = (key) => {
    if (isOfDirection(key)) {
      setDirection(key);
    }
  };

  return (<Flex alignItems="end" gap={10} wrap>
    <Picker label="Align" items={alignItems} selectedKey={align} onSelectionChange={handleAlignChange}>
      {(item) => <Item key={item.key}>{item.label}</Item>}
    </Picker>
    <Picker label="Direction" items={directionItems} selectedKey={direction} onSelectionChange={handleDirectionChange}>
      {(item) => <Item key={item.key}>{item.label}</Item>}
    </Picker>
    <Checkbox isSelected={shouldFlip} onChange={setShouldFlip}>Should Flip</Checkbox>
    <ActionMenu
      onAction={action('action')}
      align={align}
      direction={direction}
      shouldFlip={shouldFlip}>
      <Item key="one">One</Item>
      <Item key="two">Two</Item>
      <Item key="three">Three</Item>
    </ActionMenu>
  </Flex>);
}

export type ActionMenuStoryFn = StoryFn<typeof Template>;
export type ActionMenuStory = StoryObj<typeof Template>;

export const Default: ActionMenuStory = {
  render: (args) => <Template {...args} />,
  args: {}
};

export const AriaLabel: ActionMenuStory = {
  render: (args) => <Template {...args} />,
  args: {'aria-label': 'Some more actions'}
};

export const DOMId: ActionMenuStory = {
  render: (args) => <Template {...args} />,
  args: {id: 'my-action-menu'}
};

export const Quiet: ActionMenuStory = {
  render: (args) => <Template {...args} />,
  args: {isQuiet: true}
};

export const Disabled: ActionMenuStory = {
  render: (args) => <Template {...args} />,
  args: {isDisabled: true}
};

export const DisabledKeys: ActionMenuStory = {
  render: (args) => <Template {...args} />,
  args: {disabledKeys: ['two']}
};

export const AutoFocus: ActionMenuStory = {
  render: (args) => <Template {...args} />,
  args: {autoFocus: true}
};

export const DefaultOpen: ActionMenuStory = {
  render: (args) => <Template {...args} />,
  args: {onOpenChange: action('openChange'), defaultOpen: true}
};

export const ControlledOpen: ActionMenuStoryFn = () => {
  let [open, setOpen] = React.useState(false);

  return (
    <ActionMenu
      isOpen={open}
      onOpenChange={setOpen}
      onAction={action('action')}>
      <Item key="cut">Cut</Item>
      <Item key="copy">Copy</Item>
      <Item key="paste">Paste</Item>
    </ActionMenu>
  );
};

export const DirectionAlignFlip: ActionMenuStoryFn = () => <DirectionAlignment />;

export const WithTooltip: ActionMenuStoryFn = () => (
  <TooltipTrigger delay={0}>
    <ActionMenu>
      <Item key="cut">Cut</Item>
      <Item key="copy">Copy</Item>
      <Item key="paste">Paste</Item>
    </ActionMenu>
    <Tooltip>Actions</Tooltip>
  </TooltipTrigger>
);

export const Dynamic: ActionMenuStoryFn = () => {
  const items = [
    {key: 'cut', label: 'Cut'},
    {key: 'copy', label: 'Copy'},
    {key: 'paste', label: 'Paste'}
  ];

  return (
    <ActionMenu items={items}>
      {(item) => (
        <Item key={item.key}>
          {item.label}
        </Item>
      )}
    </ActionMenu>
  );
};
