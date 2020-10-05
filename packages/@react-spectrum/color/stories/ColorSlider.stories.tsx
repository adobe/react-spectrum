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

import {Color} from '@react-stately/color';
import {ColorSlider} from '../';
import {Flex} from '@react-spectrum/layout';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/text';

storiesOf('ColorSlider', module)
  .add(
    'default',
    () => <ColorSlider defaultValue={new Color('#7f0000')} channel={'red'} />
  )
  .add(
    'step',
    () => <ColorSlider defaultValue={new Color('hsl(0, 100%, 50%)')} channel={'hue'} step={72} />
  )
  .add(
    'disabled',
    () => <ColorSlider defaultValue={new Color('#333333')} channel={'red'} isDisabled />
  )
  .add(
    'vertical',
    () => {
      let [color, setColor] = useState(new Color('#ff0000'));
      return (<Flex direction="column" alignItems="center">
        <Text>{color.getChannelValue('red')}</Text>
        <ColorSlider value={color} onChange={setColor} channel={'red'} orientation="vertical" />
      </Flex>);
    }
  )
  .add(
    'rgba',
    () => {
      let [color, setColor] = useState(new Color('#ff00ff'));
      return (<Flex gap="size-500" alignItems="center">
        <Flex direction="column" gap="size-300">
          <Text>RGBA</Text>
          <ColorSlider value={color} onChange={setColor} channel={'red'} />
          <ColorSlider value={color} onChange={setColor} channel={'green'} />
          <ColorSlider value={color} onChange={setColor} channel={'blue'} />
          <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
        </Flex>
        <Flex direction="column" alignItems="center"gap="size-100">
          <div style={{width: '100px', height: '100px', background: color.toString('css')}} />
          <Text>{color.toString('hexa')}</Text>
        </Flex>
      </Flex>);
    }
  )
  .add(
    'hsla',
    () => {
      let [color, setColor] = useState(new Color('hsla(0, 100%, 50%, 0.5)'));
      return (<Flex gap="size-500" alignItems="center">
        <Flex direction="column" gap="size-300">
          <Text>HSLA</Text>
          <ColorSlider value={color} onChange={setColor} channel={'hue'} />
          <ColorSlider value={color} onChange={setColor} channel={'saturation'} />
          <ColorSlider value={color} onChange={setColor} channel={'lightness'} />
          <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
        </Flex>
        <Flex direction="column" alignItems="center"gap="size-100">
          <div style={{width: '100px', height: '100px', background: color.toString('css')}} />
        </Flex>
      </Flex>);
    }
  );
