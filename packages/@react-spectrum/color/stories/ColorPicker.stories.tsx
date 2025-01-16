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

import {ColorArea, ColorEditor, ColorSwatch, ColorSwatchPicker, ColorWheel} from '../src';
import {ColorPicker} from '../src/ColorPicker';
import {Flex} from '@react-spectrum/layout';
import React from 'react';

export default {
  title: 'ColorPicker',
  component: ColorPicker,
  argTypes: {
    value: {
      control: 'color'
    },
    label: {
      control: 'text'
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
};

export const Default = (args) => (
  <ColorPicker defaultValue="#f00" {...args}>
    <ColorEditor />
  </ColorPicker>
);

export const Custom = (args) => (
  <ColorPicker defaultValue="#f00" {...args}>
    <ColorWheel />
    <ColorArea 
      colorSpace="hsb"
      xChannel="saturation"
      yChannel="brightness"
      size="size-400"
      position="absolute"
      top="calc(50% - size-400)"
      left="calc(50% - size-400)" />
  </ColorPicker>
);

export const Swatches = (args) => (
  <ColorPicker defaultValue="#A00" {...args}>
    <Flex direction="column" gap="size-300">
      <ColorEditor />
      <ColorSwatchPicker>
        <ColorSwatch color="#A00" />
        <ColorSwatch color="#f80" />
        <ColorSwatch color="#080" />
        <ColorSwatch color="#08f" />
        <ColorSwatch color="#088" />
        <ColorSwatch color="#008" />
      </ColorSwatchPicker>
    </Flex>
  </ColorPicker>
);
