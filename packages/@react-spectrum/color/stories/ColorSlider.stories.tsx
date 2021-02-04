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
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/text';

storiesOf('ColorSlider', module)
  .add(
    'default',
    () => <ColorSlider defaultValue="#7f0000" channel={'red'} />
  )
  .add(
    'no label',
    () => <ColorSlider defaultValue="#7f0000" channel={'red'} label={null} />
  )
  .add(
    'no value label',
    () => <ColorSlider defaultValue="#7f0000" channel={'red'} showValueLabel={false} />
  )
  .add(
    'no label, no value label',
    () => <ColorSlider defaultValue="#7f0000" channel={'red'} label={null} showValueLabel={false} />
  )
  .add(
    'aria-label with no label, no value label',
    () => <ColorSlider defaultValue="#7f0000" channel={'red'} aria-label="Color Picker Channel: " label={null} showValueLabel={false} />
  )
  .add(
    'step',
    () => <ColorSlider defaultValue="hsl(0, 100%, 50%)" channel={'hue'} step={72} />
  )
  .add(
    'disabled',
    () => <ColorSlider defaultValue="#333333" channel={'red'} isDisabled />
  )
  .add(
    'vertical',
    () => <ColorSlider defaultValue="#ff0000" channel={'red'} orientation="vertical" />
  )
  .add(
    'controlled',
    () => <ColorSlider value="#ff0000" channel={'red'} />
  )
  .add(
    'custom width',
    () => <ColorSlider defaultValue="#7f0000" channel={'red'} width={300} />
  )
  .add(
    'custom height',
    () => <ColorSlider defaultValue="#7f0000" channel={'red'} orientation="vertical" height={300} />
  )
  .add(
    'rgba',
    () => {
      let [color, setColor] = useState(parseColor('#ff00ff'));
      return (<div role="group" aria-label="RGBa Color Picker">
        <Flex gap="size-500" alignItems="center">
          <Flex direction="column">
            <ColorSlider value={color} onChange={setColor} channel={'red'} />
            <ColorSlider value={color} onChange={setColor} channel={'green'} />
            <ColorSlider value={color} onChange={setColor} channel={'blue'} />
            <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
          </Flex>
          <Flex direction="column" alignItems="center"gap="size-100">
            <div style={{width: '100px', height: '100px', background: color.toString('css')}} />
            <Text>{color.toString('hexa')}</Text>
          </Flex>
        </Flex>
      </div>);
    }
  )
  .add(
    'hsla',
    () => {
      let [color, setColor] = useState(parseColor('hsla(0, 100%, 50%, 0.5)'));
      return (<div role="group" aria-label="HSLAa Color Picker">
        <Flex gap="size-500" alignItems="center">
          <Flex direction="column">
            <ColorSlider value={color} onChange={setColor} channel={'hue'} />
            <ColorSlider value={color} onChange={setColor} channel={'saturation'} />
            <ColorSlider value={color} onChange={setColor} channel={'lightness'} />
            <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
          </Flex>
          <Flex direction="column" alignItems="center" gap="size-100">
            <div style={{width: '100px', height: '100px', background: color.toString('css')}} />
          </Flex>
        </Flex>
      </div>);
    }
  )
  .add(
    'hsba',
    () => {
      let [color, setColor] = useState(parseColor('hsba(0, 100%, 50%, 0.5)'));
      return (<div role="group" aria-label="HSBAa Color Picker">
        <Flex gap="size-500" alignItems="center">
          <Flex direction="column">
            <ColorSlider value={color} onChange={setColor} channel={'hue'} />
            <ColorSlider value={color} onChange={setColor} channel={'saturation'} />
            <ColorSlider value={color} onChange={setColor} channel={'brightness'} />
            <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
          </Flex>
          <Flex direction="column" alignItems="center" gap="size-100">
            <div style={{width: '100px', height: '100px', background: color.toString('css')}} />
          </Flex>
        </Flex>
      </div>);
    }
  );
