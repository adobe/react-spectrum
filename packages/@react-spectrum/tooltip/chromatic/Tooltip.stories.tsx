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
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import React from 'react';
import {Tooltip} from '../';

type TooltipStory = ComponentStoryObj<typeof Tooltip>;

export default {
  title: 'Tooltip',
  component: Tooltip,
  args: {
    isOpen: true,
    children: 'Tooltip content'
  }
} as ComponentMeta<typeof Tooltip>;

export const Default: TooltipStory = {};

export const PlacementLeft: TooltipStory = {
  args: {placement: 'left'}
};

export const PlacementRight: TooltipStory = {
  args: {placement: 'right'}
};

export const PlacementBottom: TooltipStory = {
  args: {placement: 'bottom'}
};

export const Info: TooltipStory = {
  args: {variant: 'info'}
};

export const Positive: TooltipStory = {
  args: {variant: 'positive'}
};

export const Negative: TooltipStory = {
  args: {variant: 'negative'}
};

export const NeutralShowIcon: TooltipStory = {
  args: {showIcon: true}
};

export const InfoShowIcon: TooltipStory = {
  args: {
    variant: 'info',
    showIcon: true
  }
};

export const LongContentInfoShowIcon: TooltipStory = {
  args: {
    variant: 'info',
    showIcon: true,
    children: (
      <div>
        Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
        Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero
        sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.
        Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed,
        commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros
        ipsum rutrum orci, sagittis tempus lacus enim ac dui.
      </div>
    )
  }
};
