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

import {AriaComboBoxProps} from '@react-aria/combobox';
import {ComboBox} from './example';
import {Item} from '@react-stately/collections';
import React, {JSX} from 'react';
import {StoryObj} from '@storybook/react';

export default {
  title: 'useComboBox'
};

export type TemplateStory = StoryObj<typeof Template>;

let lotsOfItems: any[] = [];
for (let i = 0; i < 50; i++) {
  lotsOfItems.push({name: 'Item ' + i});
}

const Template = (args: AriaComboBoxProps<any>): JSX.Element => (
  <ComboBox {...args} label="Example" defaultItems={lotsOfItems}>
    {(item: any) => <Item key={item.name}>{item.name}</Item>}
  </ComboBox>
);

export const ScrollTesting: TemplateStory = {
  render: Template,
  args: {}
};

export const Disabled: TemplateStory = {
  render: Template,
  args: {isDisabled: true}
};

export const FocusWrapping: TemplateStory = {
  render: Template,
  args: {shouldFocusWrap: true}
};
