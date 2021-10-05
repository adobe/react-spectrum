/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ColorSlider} from '../';
import {Flex} from '@react-spectrum/layout';
import {parseColor} from '@react-stately/color';
import React, {useState} from 'react';
import {Text} from '@react-spectrum/text';

export default {
  title: 'ColorSlider'
};

export const Default = () => (
  <ColorSlider defaultValue="#7f0000" channel={'red'} />
);

Default.story = {
  name: 'default'
};

export const NoLabelDefaultAriaLabel = () => (
  <ColorSlider defaultValue="#7f0000" channel={'red'} label={null} />
);

NoLabelDefaultAriaLabel.story = {
  name: 'no label, default aria-label'
};

export const NoValueLabel = () => (
  <ColorSlider defaultValue="#7f0000" channel={'red'} showValueLabel={false} />
);

NoValueLabel.story = {
  name: 'no value label'
};

export const CustomAriaLabel = () => (
  <ColorSlider
    defaultValue="#7f0000"
    channel={'red'}
    aria-label="Color Picker Channel: Red" />
);

CustomAriaLabel.story = {
  name: 'custom aria-label'
};

export const Step = () => (
  <ColorSlider defaultValue="hsl(0, 100%, 50%)" channel={'hue'} step={72} />
);

Step.story = {
  name: 'step'
};

export const Disabled = () => (
  <ColorSlider defaultValue="#333333" channel={'red'} isDisabled />
);

Disabled.story = {
  name: 'disabled'
};

export const Vertical = () => (
  <ColorSlider defaultValue="#ff0000" channel={'red'} orientation="vertical" />
);

Vertical.story = {
  name: 'vertical'
};

export const Controlled = () => <ColorSlider value="#ff0000" channel={'red'} />;

Controlled.story = {
  name: 'controlled'
};

export const CustomWidth = () => (
  <ColorSlider defaultValue="#7f0000" channel={'red'} width={300} />
);

CustomWidth.story = {
  name: 'custom width'
};

export const CustomHeight = () => (
  <ColorSlider
    defaultValue="#7f0000"
    channel={'red'}
    orientation="vertical"
    height={300} />
);

CustomHeight.story = {
  name: 'custom height'
};

export const Rgba = () => {
  let [color, setColor] = useState(parseColor('#ff00ff'));
  return (
    <div role="group" aria-label="RGBA Color Picker">
      <Flex gap="size-500" alignItems="center">
        <Flex direction="column">
          <ColorSlider value={color} onChange={setColor} channel={'red'} />
          <ColorSlider value={color} onChange={setColor} channel={'green'} />
          <ColorSlider value={color} onChange={setColor} channel={'blue'} />
          <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
        </Flex>
        <Flex direction="column" alignItems="center" gap="size-100">
          <div
            style={{
              width: '100px',
              height: '100px',
              background: color.toString('css')
            }} />
          <Text>{color.toString('hexa')}</Text>
        </Flex>
      </Flex>
    </div>
  );
};

Rgba.story = {
  name: 'rgba'
};

export const Hsla = () => {
  let [color, setColor] = useState(parseColor('hsla(0, 100%, 50%, 0.5)'));
  return (
    <div role="group" aria-label="HSLA Color Picker">
      <Flex gap="size-500" alignItems="center">
        <Flex direction="column">
          <ColorSlider value={color} onChange={setColor} channel={'hue'} />
          <ColorSlider
            value={color}
            onChange={setColor}
            channel={'saturation'} />
          <ColorSlider
            value={color}
            onChange={setColor}
            channel={'lightness'} />
          <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
        </Flex>
        <Flex direction="column" alignItems="center" gap="size-100">
          <div
            style={{
              width: '100px',
              height: '100px',
              background: color.toString('css')
            }} />
        </Flex>
      </Flex>
    </div>
  );
};

Hsla.story = {
  name: 'hsla'
};

export const Hsba = () => {
  let [color, setColor] = useState(parseColor('hsba(0, 100%, 50%, 0.5)'));
  return (
    <div role="group" aria-label="HSBA Color Picker">
      <Flex gap="size-500" alignItems="center">
        <Flex direction="column">
          <ColorSlider value={color} onChange={setColor} channel={'hue'} />
          <ColorSlider
            value={color}
            onChange={setColor}
            channel={'saturation'} />
          <ColorSlider
            value={color}
            onChange={setColor}
            channel={'brightness'} />
          <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
        </Flex>
        <Flex direction="column" alignItems="center" gap="size-100">
          <div
            style={{
              width: '100px',
              height: '100px',
              background: color.toString('css')
            }} />
        </Flex>
      </Flex>
    </div>
  );
};

Hsba.story = {
  name: 'hsba'
};
