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
import {Meta, Story} from '@storybook/react';
import React from 'react';
import {SpectrumTooltipTriggerProps} from '@react-types/tooltip';
import {Tooltip, TooltipTrigger} from '../';

const meta: Meta<SpectrumTooltipTriggerProps> = {
  title: 'TooltipTrigger',
  component: TooltipTrigger,
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], locales: ['en-US'], scales: ['medium'], disableAnimations: true},
    // chromatic needs a bit more time than disableAnimations allows
    chromatic: {pauseAnimationAtEnd: true}
  }
};

export default meta;

const Template = (): Story<SpectrumTooltipTriggerProps> => (args) => (
  <TooltipTrigger {...args} defaultOpen>
    <ActionButton>Trigger Tooltip</ActionButton>
    <Tooltip>
      Tooltip message.
    </Tooltip>
  </TooltipTrigger>
);


export const Default = Template().bind({});
Default.args = {};

export const PlacementStart = Template().bind({});
PlacementStart.args = {...Default.args, placement: 'start'};

export const PlacementEnd = Template().bind({});
PlacementEnd.args = {...Default.args, placement: 'end'};
