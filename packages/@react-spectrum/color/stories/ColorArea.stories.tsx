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

import {action} from '@storybook/addon-actions';
import {ColorArea, ColorSlider} from '../';
import {ColorChannel, SpectrumColorAreaProps} from '@react-types/color';
import {Flex} from '@adobe/react-spectrum';
import {parseColor} from '@react-stately/color';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/text';

let RGB: Set<ColorChannel> = new Set(['red', 'green', 'blue']);
let difference = (a, b): Set<ColorChannel> => new Set([...a].filter(x => !b.has(x)));

function ColorAreaExample(props: SpectrumColorAreaProps) {
  let {xChannel, yChannel} = props;
  let channels = new Set([xChannel, yChannel]);
  let zChannel: ColorChannel = difference(RGB, channels).keys().next().value as ColorChannel;
  let [color, setColor] = useState(parseColor('#ff00ff'));
  return (<div role="group" aria-label="RGB Color Picker">
    <Flex gap="size-500" alignItems="center">
      <Flex direction="column" gap="size-50" width={'size-2000'}>
        <ColorArea
          value={color}
          onChange={(e) => {
            action('change')(e);
            setColor(e);
          }}
          xChannel={xChannel}
          yChannel={yChannel} />
        <ColorSlider value={color} onChange={setColor} channel={zChannel} />
      </Flex>
      <Flex direction="column" alignItems="center" gap="size-100" minWidth={'size-2000'}>
        <div role="img" aria-label={`color swatch: ${color.toString('rgb')}`} title={`${color.toString('hex')}`} style={{width: '100px', height: '100px', background: color.toString('css')}} />
        <Text>{color.toString('hex')}</Text>
      </Flex>
    </Flex>
  </div>);
}

storiesOf('ColorArea', module)
  .add(
    'RGB xChannel="blue", yChannel="green"',
    () => <ColorAreaExample xChannel={'blue'} yChannel={'green'} />
  )
  .add(
    'RGB xChannel="green", yChannel="blue"',
    () => <ColorAreaExample xChannel={'green'} yChannel={'blue'} />
  )
  .add(
    'RGB xChannel="blue", yChannel="red"',
    () => <ColorAreaExample xChannel={'blue'} yChannel={'red'} />
  )
  .add(
    'RGB xChannel="red", yChannel="blue"',
    () => <ColorAreaExample xChannel={'red'} yChannel={'blue'} />
  )
  .add(
    'RGB xChannel="red", yChannel="green"',
    () => <ColorAreaExample xChannel={'red'} yChannel={'green'} />
  )
  .add(
    'RGB xChannel="green", yChannel="red"',
    () => <ColorAreaExample xChannel={'green'} yChannel={'red'} />
  );
