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

import {ColorSwatch} from '../src/ColorSwatch';
import {ColorSwatchPicker} from '../src/ColorSwatchPicker';
import React from 'react';

export default {
  title: 'ColorSwatchPicker',
  component: ColorSwatchPicker,
  argTypes: {
    value: {
      control: 'color'
    },
    rounding: {
      control: 'radio',
      options: ['none', 'default', 'full']
    },
    size: {
      control: 'radio',
      options: ['XS', 'S', 'M', 'L']
    },
    density: {
      control: 'radio',
      options: ['compact', 'regular', 'spacious']
    }
  }
};

export const Default = (args) => (
  <ColorSwatchPicker defaultValue="#f00" {...args}>
    <ColorSwatch color="#f00" />
    <ColorSwatch color="#0f0" />
    <ColorSwatch color="#0ff" />
    <ColorSwatch color="#00f" />
  </ColorSwatchPicker>
);

export const ManySwatches = (args) => (
  <ColorSwatchPicker {...args} maxWidth="size-3000">
    {Array.from(Array(24)).map(() => {
      let color = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
      return <ColorSwatch key={color} color={color} />;
    })}
  </ColorSwatchPicker>
);
