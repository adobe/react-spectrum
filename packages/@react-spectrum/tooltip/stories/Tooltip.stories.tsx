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
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {Tooltip} from '../src';

type TooltipStory = StoryObj<typeof Tooltip>;

const argTypes = {
  placement: {
    control: 'radio',
    options: ['top', 'bottom', 'left', 'right']
  },
  variant: {
    control: 'radio',
    options: [undefined, 'neutral', 'info', 'positive', 'negative']
  },
  showIcon: {
    control: 'boolean'
  },
  isOpen: {
    control: {disable: true}
  }
};

export default {
  title: 'Tooltip',
  component: Tooltip,
  args: {
    isOpen: true,
    children: 'This is a tooltip'
  },
  argTypes: argTypes
} as Meta<typeof Tooltip>;

export const Default: TooltipStory = {};

export const LongContent: TooltipStory = {
  args: {
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
