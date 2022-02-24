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
import {ColorArea, ColorSlider, ColorWheel} from '../';
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
let HSL: Set<ColorChannel> = new Set(['hue', 'saturation', 'lightness']);
let HSB: Set<ColorChannel> = new Set(['hue', 'saturation', 'brightness']);
let difference = (a, b): Set<ColorChannel> => new Set([...a].filter(x => !b.has(x)));

function ColorAreaExample(props: SpectrumColorAreaProps) {
  let {xChannel, yChannel, isDisabled} = props;
  let defaultValue = typeof props.defaultValue === 'string' ? parseColor(props.defaultValue) : props.defaultValue;
  let [color, setColor] = useState(defaultValue || parseColor('#ff00ff'));
  let channels = new Set([xChannel, yChannel]);
  let colorSpace = color.getColorSpace();
  let colorSpaceSet = RGB;
  switch (colorSpace) {
    case 'hsl':
      colorSpaceSet = HSL;
      break;
    case 'hsb':
      colorSpaceSet = HSB;
      break;
  } 
  let zChannel: ColorChannel = difference(colorSpaceSet, channels).keys().next().value;
  let isHue = zChannel === 'hue';
  return (<div role="group" aria-label={`${colorSpace.toUpperCase()} Color Picker`}>
    <Flex gap="size-500" alignItems="center">
      <Flex direction="column" gap={isHue ? 0 : 'size-50'} alignItems="center">
        <ColorArea
          size={isHue ? 'size-1200' : null}
          {...props}
          value={color}
          onChange={(e) => {
            if (props.onChange) {
              props.onChange(e);
            }
            setColor(e);
          }}
          onChangeEnd={props.onChangeEnd} />
        {isHue ? (
          <ColorWheel
            value={color}
            onChange={(e) => {
              if (props.onChange) {
                props.onChange(e);
              }
              setColor(e);
            }}
            onChangeEnd={props.onChangeEnd}
            isDisabled={isDisabled}
            size={'size-2400'}
            UNSAFE_style={{
              marginTop: 'calc( -.75 * var(--spectrum-global-dimension-size-2400))'
            }} />
        ) : (
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
        )}
      </Flex>
      <Flex direction="column" alignItems="center" gap="size-200" minWidth={'size-2000'}>
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

export let XBlueYGreenStep16 = Template.bind({});
XBlueYGreenStep16.storyName = 'RGB xChannel="blue", yChannel="green", step="16"';
XBlueYGreenStep16.args = {...XBlueYGreen.args, xChannelStep: 16, yChannelStep: 16};

export let XBlueYGreenPageStep32 = Template.bind({});
XBlueYGreenPageStep32.storyName = 'RGB xChannel="blue", yChannel="green", pageStep="32"';
XBlueYGreenPageStep32.args = {...XBlueYGreen.args, xChannelPageStep: 32, yChannelPageStep: 32};

/* TODO: what does a disabled color area look like? */
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

export let XSaturationYLightness = Template.bind({});
XSaturationYLightness.storyName = 'HSL xChannel="saturation", yChannel="lightness"';
XSaturationYLightness.args = {xChannel: 'saturation', yChannel: 'lightness', defaultValue: 'hsl(0, 100%, 50%)', onChange: action('onChange'), onChangeEnd: action('onChangeEnd')};

export let XLightnessYSaturation = Template.bind({});
XLightnessYSaturation.storyName = 'HSL xChannel="lightness", yChannel="saturation"';
XLightnessYSaturation.args = {xChannel: 'lightness', yChannel: 'saturation', defaultValue: 'hsl(0, 100%, 50%)', onChange: action('onChange'), onChangeEnd: action('onChangeEnd')};

/* TODO: what does a disabled color area look like? */
export let XSaturationYLightnessisDisabled = Template.bind({});
XSaturationYLightnessisDisabled.storyName = 'HSL xChannel="saturation", yChannel="lightness", isDisabled';
XSaturationYLightnessisDisabled.args = {...XSaturationYLightness.args, isDisabled: true};

export let XHueYSaturationHSL = Template.bind({});
XHueYSaturationHSL.storyName = 'HSL xChannel="hue", yChannel="saturation"';
XHueYSaturationHSL.args = {xChannel: 'hue', yChannel: 'saturation', defaultValue: 'hsl(0, 100%, 50%)', onChange: action('onChange'), onChangeEnd: action('onChangeEnd')};

export let XSaturationYHueHSL = Template.bind({});
XSaturationYHueHSL.storyName = 'HSL xChannel="saturation", yChannel="hue"';
XSaturationYHueHSL.args = {xChannel: 'saturation', yChannel: 'hue', defaultValue: 'hsl(0, 100%, 50%)', onChange: action('onChange'), onChangeEnd: action('onChangeEnd')};

/* TODO: what does a disabled color area look like? */
export let XHueYSaturationHSLisDisabled = Template.bind({});
XHueYSaturationHSLisDisabled.storyName = 'HSL xChannel="hue", yChannel="saturation", isDisabled';
XHueYSaturationHSLisDisabled.args = {...XHueYSaturationHSL.args, isDisabled: true};

export let XHueYLightnessHSL = Template.bind({});
XHueYLightnessHSL.storyName = 'HSL xChannel="hue", yChannel="lightness"';
XHueYLightnessHSL.args = {xChannel: 'hue', yChannel: 'lightness', defaultValue: 'hsl(0, 100%, 50%)', onChange: action('onChange'), onChangeEnd: action('onChangeEnd')};

export let XLightnessYHueHSL = Template.bind({});
XLightnessYHueHSL.storyName = 'HSL xChannel="lightness", yChannel="hue"';
XLightnessYHueHSL.args = {xChannel: 'lightness', yChannel: 'hue', defaultValue: 'hsl(0, 100%, 50%)', onChange: action('onChange'), onChangeEnd: action('onChangeEnd')};

/* TODO: what does a disabled color area look like? */
export let XHueYLightnessHSLisDisabled = Template.bind({});
XHueYLightnessHSLisDisabled.storyName = 'HSL xChannel="hue", yChannel="lightness", isDisabled';
XHueYLightnessHSLisDisabled.args = {...XHueYLightnessHSL.args, isDisabled: true};

export let XSaturationYBrightness = Template.bind({});
XSaturationYBrightness.storyName = 'HSB xChannel="saturation", yChannel="brightness"';
XSaturationYBrightness.args = {xChannel: 'saturation', yChannel: 'brightness', defaultValue: 'hsb(0, 100%, 100%)', onChange: action('onChange'), onChangeEnd: action('onChangeEnd')};

export let XBrightnessYSaturation = Template.bind({});
XBrightnessYSaturation.storyName = 'HSB xChannel="brightness", yChannel="saturation"';
XBrightnessYSaturation.args = {xChannel: 'brightness', yChannel: 'saturation', defaultValue: 'hsb(0, 100%, 100%)', onChange: action('onChange'), onChangeEnd: action('onChangeEnd')};

/* TODO: what does a disabled color area look like? */
export let XSaturationYBrightnessisDisabled = Template.bind({});
XSaturationYBrightnessisDisabled.storyName = 'HSB xChannel="saturation", yChannel="brightness", isDisabled';
XSaturationYBrightnessisDisabled.args = {...XSaturationYBrightness.args, isDisabled: true};

export let XHueYSaturationHSB = Template.bind({});
XHueYSaturationHSB.storyName = 'HSB xChannel="hue", yChannel="saturation"';
XHueYSaturationHSB.args = {xChannel: 'hue', yChannel: 'saturation', defaultValue: 'hsb(0, 100%, 100%)', onChange: action('onChange'), onChangeEnd: action('onChangeEnd')};

export let XSaturationYHueHSB = Template.bind({});
XSaturationYHueHSB.storyName = 'HSB xChannel="saturation", yChannel="hue"';
XSaturationYHueHSB.args = {xChannel: 'saturation', yChannel: 'hue', defaultValue: 'hsb(0, 100%, 100%)', onChange: action('onChange'), onChangeEnd: action('onChangeEnd')};

/* TODO: what does a disabled color area look like? */
export let XHueYSaturationHSBisDisabled = Template.bind({});
XHueYSaturationHSBisDisabled.storyName = 'HSB xChannel="hue", yChannel="saturation", isDisabled';
XHueYSaturationHSBisDisabled.args = {...XHueYSaturationHSB.args, isDisabled: true};

export let XHueYBrightnessHSB = Template.bind({});
XHueYBrightnessHSB.storyName = 'HSB xChannel="hue", yChannel="brightness"';
XHueYBrightnessHSB.args = {xChannel: 'hue', yChannel: 'brightness', defaultValue: 'hsb(0, 100%, 100%)', onChange: action('onChange'), onChangeEnd: action('onChangeEnd')};

export let XBrightnessYHueHSB = Template.bind({});
XBrightnessYHueHSB.storyName = 'HSB xChannel="brightness", yChannel="hue"';
XBrightnessYHueHSB.args = {xChannel: 'brightness', yChannel: 'hue', defaultValue: 'hsb(0, 100%, 100%)', onChange: action('onChange'), onChangeEnd: action('onChangeEnd')};

/* TODO: what does a disabled color area look like? */
export let XBrightnessYHueHSBisDisabled = Template.bind({});
XBrightnessYHueHSBisDisabled.storyName = 'HSB xChannel="brightness", yChannel="hue", isDisabled';
XBrightnessYHueHSBisDisabled.args = {...XBrightnessYHueHSB.args, isDisabled: true};
