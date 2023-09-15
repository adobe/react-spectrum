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

import {ActionGroup, Toolbar} from '../';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import CopyIcon from '@spectrum-icons/workflow/Copy';
import DeleteIcon from '@spectrum-icons/workflow/Delete';
import {Divider} from '@react-spectrum/divider';
import DrawIcon from '@spectrum-icons/workflow/Draw';
import InfoIcon from '@spectrum-icons/workflow/Info';
import {Item} from '@react-stately/collections';
import PropertiesIcon from '@spectrum-icons/workflow/Properties';
import React from 'react';
import {Tooltip, TooltipTrigger} from '@react-spectrum/tooltip';
import ViewCardIcon from '@spectrum-icons/workflow/ViewCard';
import ViewGridIcon from '@spectrum-icons/workflow/ViewGrid';
import ViewListIcon from '@spectrum-icons/workflow/ViewList';

export default {
  title: 'Toolbar',
  component: Toolbar,
  argTypes: {
    children: {
      table: {
        disable: true
      }
    },
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical']
    }
  }
} as ComponentMeta<typeof Toolbar>;

export type ToolbarStory = ComponentStoryObj<typeof Toolbar>;

let items1 = [
  {id: 'edit', textValue: 'Edit', icon: DrawIcon},
  {id: 'copy', textValue: 'Copy', icon: CopyIcon},
  {id: 'delete', textValue: 'Delete', icon: DeleteIcon}
];
let items2 = [
  {id: 'grid', textValue: 'Grid view', icon: ViewGridIcon},
  {id: 'list', textValue: 'List view', icon: ViewListIcon},
  {id: 'card', textValue: 'Gallery view', icon: ViewCardIcon}
];
let items3 = [
  {id: 'properties', textValue: 'Properties', icon: PropertiesIcon},
  {id: 'info', textValue: 'Info', icon: InfoIcon}
];


export const Default: ToolbarStory = {
  args: {
    children: (
      <>
        <ActionGroup items={items1} aria-label="manage">
          {(item) => {
            let Icon = item.icon;
            return (
              <TooltipTrigger>
                <Item key={item.id} textValue={item.textValue}><Icon /></Item>
                <Tooltip>{item.textValue}</Tooltip>
              </TooltipTrigger>
            );
          }}
        </ActionGroup>
        <Divider />
        <ActionGroup items={items2} aria-label="view">
          {(item) => {
            let Icon = item.icon;
            return <Item key={item.id} textValue={item.textValue}><Icon /></Item>;
          }}
        </ActionGroup>
      </>
    )
  }
};

export const DisabledKeys: ToolbarStory = {
  args: {
    children: (
      <>
        <ActionGroup items={items1} disabledKeys={new Set(['copy'])} aria-label="manage">
          {(item) => {
            let Icon = item.icon;
            return (
              <TooltipTrigger>
                <Item key={item.id} textValue={item.textValue}><Icon /></Item>
                <Tooltip>{item.textValue}</Tooltip>
              </TooltipTrigger>
            );
          }}
        </ActionGroup>
        <Divider />
        <ActionGroup items={items2} isDisabled aria-label="view">
          {(item) => {
            let Icon = item.icon;
            return <Item key={item.id} textValue={item.textValue}><Icon /></Item>;
          }}
        </ActionGroup>
        <Divider />
        <ActionGroup items={items3} aria-label="inspect">
          {(item) => {
            let Icon = item.icon;
            return <Item key={item.id} textValue={item.textValue}><Icon /></Item>;
          }}
        </ActionGroup>
      </>
    )
  }
};
