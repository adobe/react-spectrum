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
import {Example} from '../stories/ColorSwatchPicker.stories';
import type {Meta} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};


const meta: Meta<typeof ColorSwatchPicker> = {
  component: ColorSwatchPicker,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/ColorSwatchPicker'
};

export default meta;

export {Example};

let colors = [
  '#b3e5c2',
  '#71fa78',
  '#51a358',
  '#0346d4',
  '#6f975c',
  '#d1239a',
  '#70f72d',
  '#36f556',
  '#470a97',
  '#1c0aa4',
  '#3500c0',
  '#dcd549',
  '#bfb405',
  '#710ac9',
  '#342c8f',
  '#858af4',
  '#133c2b',
  '#14dbac',
  '#41696c',
  '#f28686',
  '#58f9a5',
  '#ff8553',
  '#7cf5c3',
  '#bb6b41'
];

export const ManySwatches = (args: any) => (
  <ColorSwatchPicker {...args} styles={style({maxWidth: 192})}>
    {colors.map((color) => {
      return <ColorSwatch key={color} color={color} />;
    })}
  </ColorSwatchPicker>
);
