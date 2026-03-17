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

import {ColorThumb} from '../src/ColorThumb';
import {Meta, StoryObj} from '@storybook/react';
import {parseColor} from '@react-stately/color';
import React from 'react';

export type ColorThumbStory = StoryObj<typeof ColorThumb>;

export default {
  title: 'ColorThumb',
  component: ColorThumb,
  argTypes: {
    value: {
      table: {
        disable: true
      }
    },
    isFocused: {
      control: 'boolean'
    },
    isDragging: {
      control: 'boolean'
    },
    isDisabled: {
      control: 'boolean'
    }
  }
} as Meta<typeof ColorThumb>;

export const Default: ColorThumbStory = {
  args: {value: parseColor('#f00')},
  render: (args) => <ColorThumb {...args} />
};

export const Alpha: ColorThumbStory = {
  ...Default,
  args: {value: parseColor('hsla(0, 100%, 100%, 0)')}
};
