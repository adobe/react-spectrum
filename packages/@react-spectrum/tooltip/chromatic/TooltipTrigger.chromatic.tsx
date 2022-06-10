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
import {ActionButton} from '@react-spectrum/button';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import React from 'react';
import {Tooltip, TooltipTrigger} from '../';

type TooltipTriggerStory = ComponentStoryObj<typeof TooltipTrigger>;

export default {
  title: 'TooltipTrigger',
  component: TooltipTrigger,
  args: {
    defaultOpen: true,
    children: [
      <ActionButton>Trigger Tooltip</ActionButton>,
      <Tooltip>Tooltip message.</Tooltip>
    ]
  },
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      locales: ['en-US'],
      scales: ['medium'],
      disableAnimations: true
    },
    // chromatic needs a bit more time than disableAnimations allows
    chromatic: {
      pauseAnimationAtEnd: true
    }
  }
} as ComponentMeta<typeof TooltipTrigger>;

export const Default: TooltipTriggerStory = {};

export const PlacementStart: TooltipTriggerStory = {
  args: {placement: 'start'}
};

export const Offset50: TooltipTriggerStory = {
  args: {offset: 50}
};

export const CrossOffset50: TooltipTriggerStory = {
  args: {crossOffset: 50}
};

export const ContainerPadding50AtEdge: TooltipTriggerStory = {
  args: {containerPadding: 50},
  decorators: [(Story) => (
    <div style={{width: '100%'}}>
      <Story />
    </div>
  )]
};

export const ArrowPositioningAtEdge: TooltipTriggerStory = {
  args: {
    children: [
      <ActionButton>Trigger Tooltip</ActionButton>,
      <Tooltip>Long tooltip message that just goes on and on.</Tooltip>
    ]
  },
  decorators: [(Story) => (
    <div style={{width: '100%'}}>
      <Story />
    </div>
  )]
};

export const PlacementSideFlip: TooltipTriggerStory = {
  args: {
    placement: 'start',
    shouldFlip: false,
    children: [
      <ActionButton>Trigger Tooltip</ActionButton>,
      <Tooltip>Long tooltip message that just goes on and on again.</Tooltip>
    ]
  },
  decorators: [(Story) => (
    <div style={{width: '100%'}}>
      <Story />
    </div>
  )]
};
