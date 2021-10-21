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
import {Meta, Story} from '@storybook/react';
import {parseColor} from '@react-stately/color';
import React, {useState} from 'react';
import {Text} from '@react-spectrum/text';


const meta: Meta<SpectrumColorAreaProps> = {
  title: 'ColorArea',
  component: ColorArea
};

export default meta;

const Template: Story<SpectrumColorAreaProps> = (args) => (
  <ColorAreaExample {...args} />
);

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

export let XBlueYGreen = Template.bind({});
XBlueYGreen.title = 'RGB xChannel="blue", yChannel="green"';
XBlueYGreen.args = {xChannel: 'blue', yChannel: 'green'};

export let XGreenYBlue = Template.bind({});
XGreenYBlue.title = 'RGB xChannel="green", yChannel="blue"';
XGreenYBlue.args = {xChannel: 'green', yChannel: 'blue'};

export let XBlueYRed = Template.bind({});
XBlueYRed.title = 'RGB xChannel="blue", yChannel="red"';
XBlueYRed.args = {xChannel: 'blue', yChannel: 'red'};

export let XRedYBlue = Template.bind({});
XRedYBlue.title = 'GB xChannel="red", yChannel="blue"';
XRedYBlue.args = {xChannel: 'red', yChannel: 'blue'};

export let XRedYGreen = Template.bind({});
XRedYGreen.title = 'RGB xChannel="red", yChannel="green"';
XRedYGreen.args = {xChannel: 'red', yChannel: 'green'};

export let XGreenYRed = Template.bind({});
XGreenYRed.title = 'RGB xChannel="green", yChannel="red"';
XGreenYRed.args = {xChannel: 'green', yChannel: 'red'};
