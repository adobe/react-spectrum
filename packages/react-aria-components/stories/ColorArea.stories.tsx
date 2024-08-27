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

import {ColorArea, ColorThumb} from '../src';
import {ColorSliderExample} from './ColorSlider.stories';
import {parseColor} from '@react-stately/color';
import React, {useState} from 'react';

export default {
  title: 'React Aria Components',
  decorators: [
    (Story, ctx) => {
      let args = ctx.args;
      let [color, setColor] = useState(parseColor(args.defaultValue));
      let zChannel = color.getColorChannels().find(c => c !== args.xChannel && c !== args.yChannel);
      return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          {Story({...ctx, args: {...ctx.args, value: color, onChange: setColor}})}
          <ColorSliderExample channel={zChannel} value={color} onChange={setColor} />
        </div>
      );
    }
  ]
};

const SIZE = 192;
const FOCUSED_THUMB_SIZE = 28;
const THUMB_SIZE = 20;
const BORDER_RADIUS = 4;

export const ColorAreaExample = (args) => (
  <ColorArea
    {...args}
    style={({isDisabled}) => ({
      width: SIZE,
      height: SIZE,
      borderRadius: BORDER_RADIUS,
      opacity: isDisabled ? 0.3 : undefined
    })}>
    <ColorThumb
      style={({color, isDisabled, isFocusVisible}) => ({
        background: isDisabled
          ? 'rgb(142, 142, 142)'
          : color.toString(),
        border: `2px solid ${isDisabled ? 'rgb(142, 142, 142)' : 'white'}`,
        borderRadius: '50%',
        boxShadow: '0 0 0 1px black, inset 0 0 0 1px black',
        boxSizing: 'border-box',
        height: isFocusVisible ? FOCUSED_THUMB_SIZE + 4 : THUMB_SIZE,
        transform: 'translate(-50%, -50%)',
        width: isFocusVisible ? FOCUSED_THUMB_SIZE + 4 : THUMB_SIZE
      })} />
  </ColorArea>
);

ColorAreaExample.args = {
  defaultValue: 'rgb(100, 149, 237)',
  xChannel: 'red',
  yChannel: 'green'
};

ColorAreaExample.argTypes = {
  xChannel: {
    control: 'select',
    options: ['red', 'green', 'blue']
  },
  yChannel: {
    control: 'select',
    options: ['red', 'green', 'blue']
  }
};

export const ColorAreaHSL = (args) => <ColorAreaExample {...args} />;

ColorAreaHSL.args = {
  defaultValue: 'hsl(219, 79%, 66%)',
  xChannel: 'hue',
  yChannel: 'saturation'
};

ColorAreaHSL.argTypes = {
  xChannel: {
    control: 'select',
    options: ['hue', 'saturation', 'lightness']
  },
  yChannel: {
    control: 'select',
    options: ['hue', 'saturation', 'lightness']
  }
};

export const ColorAreaHSB = (args) => <ColorAreaExample {...args} />;

ColorAreaHSB.args = {
  defaultValue: 'hsb(219, 79%, 66%)',
  xChannel: 'hue',
  yChannel: 'saturation'
};

ColorAreaHSB.argTypes = {
  xChannel: {
    control: 'select',
    options: ['hue', 'saturation', 'brightness']
  },
  yChannel: {
    control: 'select',
    options: ['hue', 'saturation', 'brightness']
  }
};
