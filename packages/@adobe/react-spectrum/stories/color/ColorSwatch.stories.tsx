/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ColorSwatch, SpectrumColorSwatchProps} from '../../src/color/ColorSwatch';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';

export default {
  title: 'ColorSwatch',
  component: ColorSwatch,
  argTypes: {
    color: {
      control: 'color'
    },
    rounding: {
      control: 'radio',
      options: ['default', 'none', 'full']
    },
    size: {
      control: 'radio',
      options: ['XS', 'S', 'M', 'L']
    }
  }
} as Meta<SpectrumColorSwatchProps>;

export type ColorSwatchStory = StoryObj<typeof ColorSwatch>;

export const Default: ColorSwatchStory = {
  render: args => <ColorSwatch {...args} />,
  args: {
    color: 'rgb(255, 0, 0)'
  }
};

export const NoValue: ColorSwatchStory = {
  render: args => <ColorSwatch {...args} />
};

export const CustomWidth: ColorSwatchStory = {
  render: args => <ColorSwatch {...args} width="size-1000" />,
  args: Default.args
};
