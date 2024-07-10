/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Item, StepList} from '../';
import React from 'react';

export type StepListStory = ComponentStoryObj<typeof StepList>;

export default {
  title: 'StepList',
  component: StepList,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  }
} as ComponentMeta<typeof StepList>;

export const HorizontalS: StepListStory = {
  args: {
    size: 'S'
  },
  render: (args) => (
    <StepList {...args} >
      <Item key="cat">Cat</Item>
      <Item key="dog">Dog</Item>
      <Item key="monkey">Monkey</Item>
      <Item key="skunk">Skunk</Item>
    </StepList>
  )
};

export const HorizontalM: StepListStory = {
  args: {
    selectedKey: 'monkey'
  },
  render: (args) => (
    <StepList {...args} >
      <Item key="cat">Cat</Item>
      <Item key="dog">Dog</Item>
      <Item key="monkey">Monkey</Item>
      <Item key="skunk">Skunk</Item>
    </StepList>
  )
};

export const HorizontalL: StepListStory = {
  args: {
    size: 'L',
    selectedKey: 'monkey',
    disabledKeys: ['dog']
  },
  render: (args) => (
    <StepList {...args} >
      <Item key="cat">Cat</Item>
      <Item key="dog">Dog</Item>
      <Item key="monkey">Monkey</Item>
      <Item key="skunk">Skunk</Item>
    </StepList>
  )
};

export const HorizontalXL: StepListStory = {
  args: {
    size: 'XL',
    isDisabled: true
  },
  render: (args) => (
    <StepList {...args} >
      <Item key="cat">Cat</Item>
      <Item key="dog">Dog</Item>
      <Item key="monkey">Monkey</Item>
      <Item key="skunk">Skunk</Item>
    </StepList>
  )
};

export const VerticalS: StepListStory = {
  args: {
    size: 'S',
    orientation: 'vertical'
  },
  render: (args) => (
    <StepList {...args} >
      <Item key="cat">Cat</Item>
      <Item key="dog">Dog</Item>
      <Item key="monkey">Monkey</Item>
      <Item key="skunk">Skunk</Item>
    </StepList>
  )
};

export const VerticalM: StepListStory = {
  args: {
    orientation: 'vertical',
    selectedKey: 'monkey'
  },
  render: (args) => (
    <StepList {...args} >
      <Item key="cat">Cat</Item>
      <Item key="dog">Dog</Item>
      <Item key="monkey">Monkey</Item>
      <Item key="skunk">Skunk</Item>
    </StepList>
  )
};

export const VerticalL: StepListStory = {
  args: {
    size: 'L',
    orientation: 'vertical',
    selectedKey: 'monkey',
    disabledKeys: ['dog']
  },
  render: (args) => (
    <StepList {...args} >
      <Item key="cat">Cat</Item>
      <Item key="dog">Dog</Item>
      <Item key="monkey">Monkey</Item>
      <Item key="skunk">Skunk</Item>
    </StepList>
  )
};

export const VerticalXL: StepListStory = {
  args: {
    size: 'XL',
    orientation: 'vertical',
    isDisabled: true
  },
  render: (args) => (
    <StepList {...args} >
      <Item key="cat">Cat</Item>
      <Item key="dog">Dog</Item>
      <Item key="monkey">Monkey</Item>
      <Item key="skunk">Skunk</Item>
    </StepList>
  )
};

export const Emphasized: StepListStory = {
  args: {
    isEmphasized: true,
    selectedKey: 'monkey',
    disabledKeys: ['dog']
  },
  render: (args) => (
    <StepList {...args} >
      <Item key="cat">Cat</Item>
      <Item key="dog">Dog</Item>
      <Item key="monkey">Monkey</Item>
      <Item key="skunk">Skunk</Item>
    </StepList>
  )
};

