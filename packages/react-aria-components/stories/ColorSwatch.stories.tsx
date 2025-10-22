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

import {ColorSwatch, ColorSwatchProps} from '../src/ColorSwatch';
import {Meta, StoryObj} from '@storybook/react';
import React, {JSX} from 'react';
import './styles.css';

export default {
  title: 'React Aria Components/ColorSwatch',
  component: ColorSwatch
} as Meta<typeof ColorSwatch>;

export type ColorSwatchStory = StoryObj<typeof ColorSwatch>;

export const ColorSwatchExampleRender = (args: ColorSwatchProps): JSX.Element => (
  <ColorSwatch
    {...args}
    style={({color}) => ({
      width: 32,
      height: 32,
      borderRadius: 4,
      boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
      background: `
        linear-gradient(${color}, ${color}),
        repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`
    })} />
);

export const ColorSwatchExample: ColorSwatchStory = {
  render: (args) => <ColorSwatchExampleRender {...args} />,
  args: {
    color: 'rgb(255, 0, 0)'
  },
  argTypes: {
    color: {
      control: 'color'
    }
  }
};
