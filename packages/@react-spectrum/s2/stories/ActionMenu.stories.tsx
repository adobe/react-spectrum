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

import {ActionMenu, MenuItem} from '../src';

import {categorizeArgTypes} from './utils';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof ActionMenu> = {
  component: ActionMenu,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', ['onAction', 'onOpenChange'])
  },
  title: 'ActionMenu'
};

export default meta;
type Story = StoryObj<typeof ActionMenu<any>>;

export const Example: Story = {
  render: (args) => {
    return (
      <ActionMenu {...args}>
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
      </ActionMenu>
    );
  }
};

interface IExampleItem {
  id: string,
  label: string
}
let items: IExampleItem[] = [
  {id: 'cut', label: 'Cut'},
  {id: 'copy', label: 'Copy'},
  {id: 'paste', label: 'Paste'}
];
export const DynamicExample: Story = {
  render: (args) => {
    return (
      <ActionMenu {...args}>
        {(item) => <MenuItem id={(item as IExampleItem).id}>{(item as IExampleItem).label}</MenuItem>}
      </ActionMenu>
    );
  },
  args: {
    items
  }
};

DynamicExample.parameters = {
  docs: {
    source: {
      transform: () => {
        return `
let items = [
  {id: 'cut', label: 'Cut'},
  {id: 'copy', label: 'Copy'},
  {id: 'paste', label: 'Paste'}
];

<ActionMenu items={items}>
  {(item) => <MenuItem id={item.id>{item.label}</MenuItem>}
</ActionMenu>`;
      }
    }
  }
};
