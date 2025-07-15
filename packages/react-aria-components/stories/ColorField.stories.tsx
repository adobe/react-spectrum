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

import {ColorField, ColorFieldProps, FieldError, Input, Label} from 'react-aria-components';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import './styles.css';

export default {
  title: 'React Aria Components/ColorField',
  argTypes: {
    colorSpace: {
      control: 'select',
      options: ['rgb', 'hsl', 'hsb']
    },
    channel: {
      control: 'select',
      options: [null, 'red', 'green', 'blue', 'hue', 'saturation', 'lightness', 'brightness']
    }
  },
  component: ColorField
} as Meta<typeof ColorField>;

;
export type ColorFieldStory = StoryObj<(props: ColorFieldProps & {label: string}) => ReturnType<typeof ColorField>>;

export const ColorFieldExample: ColorFieldStory = {
  render: (args) => (
    <ColorField {...args} validate={(v) => (v?.getChannelValue('red') === 0 ? 'Invalid value' : null)}>
      <Label>{args.label}</Label>
      <Input style={{display: 'block'}} />
      <FieldError />
    </ColorField>
  ),
  args: {
    label: 'Test',
    defaultValue: '#f00'
  }
};
