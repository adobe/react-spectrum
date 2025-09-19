/**
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
// TODO: pull all the highlight styles out into a separate macro(s) for the background color, text color, etc.
import ABC from '../s2wf-icons/S2_Icon_ABC_20_N.svg';
import {
  ActionButton,
  ActionButtonGroup,
  ListView,
  ListViewItem,
  Text
} from '../src';
import Add from '../s2wf-icons/S2_Icon_Add_20_N.svg';
import {categorizeArgTypes, getActionArgs} from './utils';
import InfoCircle from '../s2wf-icons/S2_Icon_InfoCircle_20_N.svg';
import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import TextNumbers from '../s2wf-icons/S2_Icon_TextNumbers_20_N.svg';

const events = ['onSelectionChange'];

const meta: Meta<typeof ListView> = {
  title: 'Highlight Selection/ListView',
  component: ListView,
  parameters: {
    layout: 'centered'
  },
  args: {...getActionArgs(events)},
  argTypes: {
    ...categorizeArgTypes('Events', events),
    children: {table: {disable: true}}
  }
};

export default meta;

interface Item {
  id: number,
  name: string,
  type: 'letter' | 'number'
}

let items: Item[] = [
  {id: 1, name: 'Count', type: 'number'},
  {id: 2, name: 'City', type: 'letter'},
  {id: 3, name: 'Count of identities', type: 'number'},
  {id: 4, name: 'Current day', type: 'number'},
  {id: 5, name: 'Current month', type: 'letter'},
  {id: 6, name: 'Current week', type: 'number'},
  {id: 7, name: 'Current year', type: 'number'},
  {id: 8, name: 'Current whatever', type: 'number'},
  {id: 9, name: 'Alphabet', type: 'letter'},
  {id: 10, name: 'Numbers', type: 'number'}
];

export const AttributesList: StoryObj<typeof ListView> = {
  render: (args) => (
    <ListView aria-label="Dynamic list" {...args} items={items} styles={style({width: 220, height: 350})}>
      {item => (
        <ListViewItem textValue={item.name}>
          {item.type === 'number' ? <TextNumbers /> : <ABC />}
          <Text>{item.name}</Text>
          <ActionButtonGroup>
            <ActionButton aria-label="Info">
              <InfoCircle />
            </ActionButton>
            <ActionButton aria-label="Add">
              <Add />
            </ActionButton>
          </ActionButtonGroup>
        </ListViewItem>
      )}
    </ListView>
  ),
  args: {
    selectionStyle: 'highlight',
    selectionMode: 'multiple',
    highlightMode: 'inverse',
    isEmphasized: true
  }
};
