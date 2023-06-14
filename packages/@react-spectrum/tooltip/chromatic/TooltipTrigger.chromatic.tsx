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
      disableAnimations: true,
      express: false
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

export const PlacementEnd: TooltipTriggerStory = {
  args: {placement: 'end'}
};

export const Offset50: TooltipTriggerStory = {
  args: {offset: 50}
};

export const CrossOffset50: TooltipTriggerStory = {
  args: {crossOffset: 50}
};

// Test case where putting the arrow in the center of the button is no lnger viable
export const CrossOffset70: TooltipTriggerStory = {
  args: {crossOffset: 70}
};

// Test case where putting the arrow in the center of the button is no lnger viable
export const CrossOffset1000: TooltipTriggerStory = {
  args: {crossOffset: 1000}
};

export const ContainerPadding50AtEdge: TooltipTriggerStory = {
  args: {
    placement: 'start',
    containerPadding: 50,
    children: [
      <ActionButton>Trigger Tooltip</ActionButton>,
      <Tooltip>Long tooltip message that just goes on and on again. But it just keeps going and going and going and going.</Tooltip>
    ]
  },
  // padding is 231 so that it flips, this is because the tooltip has a width of 180px with the tip + 3px margin on the tooltip + 50px of container padding from this story
  // anything less than 232px padding on the div will result in a flip, so this is how we can visually test container padding
  // this uses slightly less than the required padding so that we account for any rounding and have a stable test
  decorators: [(Story) => (
    <div style={{width: '100%', padding: '230px'}}>
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

export const PlacementNoFlip: TooltipTriggerStory = {
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
