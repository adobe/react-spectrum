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
  let {xChannel, yChannel, isDisabled} = props;
  let channels = new Set([xChannel, yChannel]);
  let zChannel: ColorChannel = difference(RGB, channels).keys().next().value;
  let [color, setColor] = useState(props.defaultValue || parseColor('#ff00ff'));
  return (<div role="group" aria-label="RGB Color Picker">
    <Flex gap="size-500" alignItems="center">
      <Flex direction="column" gap="size-50" alignItems="center">
        <ColorArea
          {...props}
          value={color}
          onChange={(e) => {
            if (props.onChange) {
              props.onChange(e);
            }
            setColor(e);
          }} />
        <ColorSlider
          value={color}
          onChange={(e) => {
            if (props.onChange) {
              props.onChange(e);
            }
            setColor(e);
          }}
          onChangeEnd={props.onChangeEnd}
          channel={zChannel}
          isDisabled={isDisabled} />
      </Flex>
      <Flex direction="column" alignItems="center" gap="size-100" minWidth={'size-2000'}>
        <div role="img" aria-label={`color swatch: ${color.toString('rgb')}`} title={`${color.toString('hex')}`} style={{width: '100px', height: '100px', background: color.toString('css')}} />
        <Text>{color.toString('hex')}</Text>
      </Flex>
    </Flex>
  </div>);
}

export let XBlueYGreen = Template.bind({});
XBlueYGreen.storyName = 'RGB xChannel="blue", yChannel="green"';
XBlueYGreen.args = {xChannel: 'blue', yChannel: 'green', onChange: action('onChange'), onChangeEnd: action('onChangeEnd')};

export let XGreenYBlue = Template.bind({});
XGreenYBlue.storyName = 'RGB xChannel="green", yChannel="blue"';
XGreenYBlue.args = {...XBlueYGreen.args, xChannel: 'green', yChannel: 'blue'};

export let XBlueYRed = Template.bind({});
XBlueYRed.storyName = 'RGB xChannel="blue", yChannel="red"';
XBlueYRed.args = {...XBlueYGreen.args, xChannel: 'blue', yChannel: 'red'};

export let XRedYBlue = Template.bind({});
XRedYBlue.storyName = 'RGB xChannel="red", yChannel="blue"';
XRedYBlue.args = {...XBlueYGreen.args, xChannel: 'red', yChannel: 'blue'};

export let XRedYGreen = Template.bind({});
XRedYGreen.storyName = 'RGB xChannel="red", yChannel="green"';
XRedYGreen.args = {...XBlueYGreen.args, xChannel: 'red', yChannel: 'green'};

export let XGreenYRed = Template.bind({});
XGreenYRed.storyName = 'RGB xChannel="green", yChannel="red"';
XGreenYRed.args = {...XBlueYGreen.args, xChannel: 'green', yChannel: 'red'};

export let XBlueYGreenisDisabled = Template.bind({});
XBlueYGreenisDisabled.storyName = 'RGB xChannel="blue", yChannel="green", isDisabled';
XBlueYGreenisDisabled.args = {...XBlueYGreen.args, isDisabled: true};

/* TODO: how do we visually label and how to do we aria-label */
export let XBlueYGreenAriaLabelled = Template.bind({});
XBlueYGreenAriaLabelled.storyName = 'RGB xChannel="blue", yChannel="green", aria-label="foo"';
XBlueYGreenAriaLabelled.args = {...XBlueYGreen.args, label: undefined, ariaLabel: 'foo'};

export let XBlueYGreenSize3000 = Template.bind({});
XBlueYGreenSize3000.storyName = 'RGB xChannel="blue", yChannel="green", size="size-3000"';
XBlueYGreenSize3000.args = {...XBlueYGreen.args, size: 'size-3000'};

export let XBlueYGreenSize600 = Template.bind({});
XBlueYGreenSize600.storyName = 'RGB xChannel="blue", yChannel="green", size="size-600"';
XBlueYGreenSize600.args = {...XBlueYGreen.args, size: 'size-600'};
