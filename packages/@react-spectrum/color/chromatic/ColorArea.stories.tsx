/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ColorArea, ColorField, ColorSlider, ColorSwatch, ColorWheel} from '../';
import {Flex} from '@adobe/react-spectrum';
import {Meta, StoryFn} from '@storybook/react';
import {parseColor} from '@react-stately/color';
import React, {useState} from 'react';
import {SpectrumColorAreaProps} from '@react-types/color';

const meta: Meta<SpectrumColorAreaProps> = {
  title: 'ColorArea',
  component: ColorArea,
  parameters: {
    chromatic: {delay: 1000}
  }
};

export default meta;

const Template: StoryFn<SpectrumColorAreaProps> = (args) => <ColorAreaExample {...args} />;

function ColorAreaExample(props: SpectrumColorAreaProps) {
  let {xChannel, yChannel, isDisabled} = props;
  let defaultValue =
    typeof props.defaultValue === 'string' ? parseColor(props.defaultValue) : props.defaultValue;
  let [color, setColor] = useState(defaultValue || parseColor('#ff00ff'));
  let xyChannels = {xChannel, yChannel};
  let colorSpace = color.getColorSpace();
  let {zChannel} = color.getColorSpaceAxes(xyChannels);
  let isHue = zChannel === 'hue';

  function onChange(e) {
    const newColor = (e || color).toFormat(colorSpace);
    if (props.onChange) {
      props.onChange(newColor);
    }
    setColor(newColor);
  }

  return (
    <div role="group" aria-label={`${colorSpace.toUpperCase()} Color Picker`}>
      <Flex gap="size-500" alignItems="start">
        <Flex direction="column" gap={isHue ? 0 : 'size-50'} alignItems="center">
          <ColorArea
            size={isHue ? 'size-1200' : undefined}
            {...props}
            value={color}
            onChange={onChange}
            onChangeEnd={props.onChangeEnd} />
          {isHue ? (
            <ColorWheel
              value={color}
              onChange={onChange}
              onChangeEnd={props.onChangeEnd}
              isDisabled={isDisabled}
              size={'size-2400'}
              UNSAFE_style={{
                marginTop: 'calc( -.75 * var(--spectrum-global-dimension-size-2400))'
              }} />
          ) : (
            <ColorSlider
              value={color}
              onChange={onChange}
              onChangeEnd={props.onChangeEnd}
              channel={zChannel}
              isDisabled={isDisabled} />
          )}
        </Flex>
        <Flex direction="column" alignItems="start" gap="size-100" minWidth="size-1200">
          <ColorSwatch color={color} size="L" />
          <ColorField
            label="HEX Color"
            value={color}
            onChange={onChange}
            onKeyDown={(event) =>
              event.key === 'Enter' && onChange((event.target as HTMLInputElement).value)
            }
            isDisabled={isDisabled}
            width="size-1200" />
        </Flex>
      </Flex>
    </div>
  );
}
export const XBlueYGreen = {
  render: Template,
  name: 'RGB xChannel="blue", yChannel="green"',
  args: {xChannel: 'blue', yChannel: 'green'}
};

export const XGreenYBlue = {
  render: Template,
  name: 'RGB xChannel="green", yChannel="blue"',
  args: {...XBlueYGreen.args, xChannel: 'green', yChannel: 'blue'}
};

export const XBlueYRed = {
  render: Template,
  name: 'RGB xChannel="blue", yChannel="red"',
  args: {...XBlueYGreen.args, xChannel: 'blue', yChannel: 'red'}
};

export const XRedYBlue = {
  render: Template,
  name: 'RGB xChannel="red", yChannel="blue"',
  args: {...XBlueYGreen.args, xChannel: 'red', yChannel: 'blue'}
};

export const XRedYGreen = {
  render: Template,
  name: 'RGB xChannel="red", yChannel="green"',
  args: {...XBlueYGreen.args, xChannel: 'red', yChannel: 'green'}
};

export const XGreenYRed = {
  render: Template,
  name: 'RGB xChannel="green", yChannel="red"',
  args: {...XBlueYGreen.args, xChannel: 'green', yChannel: 'red'}
};

export const XBlueYGreenisDisabled = {
  render: Template,
  name: 'RGB xChannel="blue", yChannel="green", isDisabled',
  args: {...XBlueYGreen.args, isDisabled: true}
};

export const XBlueYGreenSize3000 = {
  render: Template,
  name: 'RGB xChannel="blue", yChannel="green", size="size-3000"',
  args: {...XBlueYGreen.args, size: 'size-3000'}
};

export const XBlueYGreenSize600 = {
  render: Template,
  name: 'RGB xChannel="blue", yChannel="green", size="size-600"',
  args: {...XBlueYGreen.args, size: 'size-600'}
};

export const XSaturationYLightness = {
  render: Template,
  name: 'HSL xChannel="saturation", yChannel="lightness"',
  args: {
    ...XBlueYGreen.args,
    xChannel: 'saturation',
    yChannel: 'lightness',
    defaultValue: 'hsl(0, 100%, 50%)'
  }
};

export const XLightnessYSaturation = {
  render: Template,
  name: 'HSL xChannel="lightness", yChannel="saturation"',
  args: {
    ...XBlueYGreen.args,
    xChannel: 'lightness',
    yChannel: 'saturation',
    defaultValue: 'hsl(0, 100%, 50%)'
  }
};

export const XHueYSaturationHSL = {
  render: Template,
  name: 'HSL xChannel="hue", yChannel="saturation"',
  args: {
    ...XSaturationYLightness.args,
    xChannel: 'hue',
    yChannel: 'saturation',
    defaultValue: 'hsl(0, 100%, 50%)'
  }
};

export const XSaturationYHueHSL = {
  render: Template,
  name: 'HSL xChannel="saturation", yChannel="hue"',
  args: {
    ...XSaturationYLightness.args,
    xChannel: 'saturation',
    yChannel: 'hue',
    defaultValue: 'hsl(0, 100%, 50%)'
  }
};

export const XHueYLightnessHSL = {
  render: Template,
  name: 'HSL xChannel="hue", yChannel="lightness"',
  args: {
    ...XHueYSaturationHSL.args,
    xChannel: 'hue',
    yChannel: 'lightness',
    defaultValue: 'hsl(0, 100%, 50%)'
  }
};

export const XLightnessYHueHSL = {
  render: Template,
  name: 'HSL xChannel="lightness", yChannel="hue"',
  args: {
    ...XHueYSaturationHSL.args,
    xChannel: 'lightness',
    yChannel: 'hue',
    defaultValue: 'hsl(0, 100%, 50%)'
  }
};

export const XSaturationYBrightness = {
  render: Template,
  name: 'HSB xChannel="saturation", yChannel="brightness"',
  args: {
    ...XHueYSaturationHSL.args,
    xChannel: 'saturation',
    yChannel: 'brightness',
    defaultValue: 'hsb(0, 100%, 100%)'
  }
};

export const XBrightnessYSaturation = {
  render: Template,
  name: 'HSB xChannel="brightness", yChannel="saturation"',
  args: {
    ...XHueYSaturationHSL.args,
    xChannel: 'brightness',
    yChannel: 'saturation',
    defaultValue: 'hsb(0, 100%, 100%)'
  }
};

export const XSaturationYBrightnessisDisabled = {
  render: Template,
  name: 'HSB xChannel="saturation", yChannel="brightness", isDisabled',
  args: {...XSaturationYBrightness.args, isDisabled: true}
};

export const XHueYSaturationHSB = {
  render: Template,
  name: 'HSB xChannel="hue", yChannel="saturation"',
  args: {
    ...XSaturationYBrightness.args,
    xChannel: 'hue',
    yChannel: 'saturation',
    defaultValue: 'hsb(0, 100%, 100%)'
  }
};

export const XSaturationYHueHSB = {
  render: Template,
  name: 'HSB xChannel="saturation", yChannel="hue"',
  args: {
    ...XSaturationYBrightness.args,
    xChannel: 'saturation',
    yChannel: 'hue',
    defaultValue: 'hsb(0, 100%, 100%)'
  }
};

export const XHueYBrightnessHSB = {
  render: Template,
  name: 'HSB xChannel="hue", yChannel="brightness"',
  args: {
    ...XHueYSaturationHSB.args,
    xChannel: 'hue',
    yChannel: 'brightness',
    defaultValue: 'hsb(0, 100%, 100%)'
  }
};

export const XBrightnessYHueHSB = {
  render: Template,
  name: 'HSB xChannel="brightness", yChannel="hue"',
  args: {
    ...XHueYSaturationHSB.args,
    xChannel: 'brightness',
    yChannel: 'hue',
    defaultValue: 'hsb(0, 100%, 100%)'
  }
};
