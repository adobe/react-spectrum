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

import {ColorThumb, ColorWheel, ColorWheelTrack} from '../src';
import React from 'react';

export default {
  title: 'React Aria Components'
};

const RADIUS = 100;
const TRACK_THICKNESS = 28;
const THUMB_SIZE = 20;


export const ColorWheelExample = (args) => (
  <ColorWheel {...args} outerRadius={RADIUS} innerRadius={RADIUS - TRACK_THICKNESS}>
    <ColorWheelTrack />
    <ColorThumb
      style={({isFocusVisible, color}) => ({
        border: '2px solid white',
        boxShadow: '0 0 0 1px black, inset 0 0 0 1px black',
        width: isFocusVisible ? TRACK_THICKNESS + 4 : THUMB_SIZE,
        height: isFocusVisible ? TRACK_THICKNESS + 4 : THUMB_SIZE,
        borderRadius: '50%',
        boxSizing: 'border-box',
        background: color.toString()
      })} />
  </ColorWheel>
);
