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
import {Label} from '../';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {TextField} from '@react-spectrum/textfield';

type LabelStory = StoryObj<typeof Label>;

const argTypes = {
  labelAlign: {
    control: 'radio',
    options: ['end', 'start']
  },
  labelPosition: {
    control: 'radio',
    options: ['side', 'top']
  },
  necessityIndicator: {
    control: 'radio',
    options: ['icon', 'label']
  },
  isRequired: {
    control: 'boolean'
  },
  htmlFor: {control: {disable: true}}
};

export default {
  title: 'Label',
  component: Label,
  args: {
    width: '100%',
    htmlFor: 'test',
    children: 'Test'
  },
  argTypes: argTypes,
  decorators: [(Story, Context) => (
    <div style={{whiteSpace: 'nowrap'}}>
      <Story />
      <TextField id={Context.args.htmlFor} isRequired={Context.args.isRequired} />
    </div>
  )]
} as Meta<typeof Label>;

export let Default: LabelStory = {};

export let WidthForLabelAlignSide: LabelStory = {
  args: {width: '80px', labelPosition: 'side'},
  argTypes: {labelPosition: {control: {disable: true}}}
};
