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
import type {Meta} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};

const meta: Meta<typeof ColorSwatchPicker> = {
  component: ColorSwatchPicker,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: {table: {category: 'Events'}}
  },
  title: 'ColorSwatchPicker'
};

export default meta;

export const Example = (args: any) => (
  <ColorSwatchPicker defaultValue="#f00" {...args}>
    <ColorSwatch color="#f00" />
    <ColorSwatch color="#0f0" />
    <ColorSwatch color="#0ff" />
    <ColorSwatch color="#00f" />
  </ColorSwatchPicker>
);

export const ManySwatches = (args: any) => (
  <ColorSwatchPicker {...args} styles={style({maxWidth: 192})}>
    {Array.from(Array(24)).map(() => {
      let color = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
      return <ColorSwatch key={color} color={color} />;
    })}
  </ColorSwatchPicker>
);
