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

import {ColorSlider, ColorThumb, Label, SliderOutput, SliderTrack} from '../src';
import React from 'react';

export default {
  title: 'React Aria Components'
};

const TRACK_THICKNESS = 28;
const THUMB_SIZE = 20;

export const ColorSliderExample = (args) => (
  <ColorSlider 
    {...args}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 192
    }}>
    <div style={{display: 'flex', alignSelf: 'stretch', justifyContent: 'space-between'}}>
      <Label />
      <SliderOutput />
    </div>
    <SliderTrack
      style={({defaultStyle}) => ({
        height: TRACK_THICKNESS,
        width: '100%',
        borderRadius: 4,
        background: `
            ${defaultStyle.background},
            repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`
      })}>
      <ColorThumb
        style={({isFocusVisible, color}) => ({
          top: TRACK_THICKNESS / 2,
          border: '2px solid white',
          boxShadow: '0 0 0 1px black, inset 0 0 0 1px black',
          width: isFocusVisible ? TRACK_THICKNESS + 4 : THUMB_SIZE,
          height: isFocusVisible ? TRACK_THICKNESS + 4 : THUMB_SIZE,
          borderRadius: '50%',
          boxSizing: 'border-box',
          background: color.toString()
        })} />
    </SliderTrack>
  </ColorSlider>
);

ColorSliderExample.args = {
  channel: 'hue',
  defaultValue: 'hsl(0, 100%, 50%)'
};

ColorSliderExample.argTypes = {
  channel: {
    control: 'select',
    options: ['hue', 'saturation', 'lightness', 'alpha']
  }
};
