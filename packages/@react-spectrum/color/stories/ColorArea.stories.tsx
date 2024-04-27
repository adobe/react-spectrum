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
import {ColorArea, ColorField, ColorSlider, ColorSwatch, ColorWheel} from '../';
import {ComponentStoryObj, Meta, StoryFn} from '@storybook/react';
import {Flex, Grid, useLocale, View} from '@adobe/react-spectrum';
import {parseColor} from '@react-stately/color';
import React, {useState} from 'react';
import {SpectrumColorAreaProps} from '@react-types/color';

const meta: Meta<SpectrumColorAreaProps> = {
  title: 'ColorArea',
  component: ColorArea,
  argTypes: {
    xChannel: {
      table: {
        disable: true
      }
    },
    yChannel: {
      table: {
        disable: true
      }
    },
    onChange: {
      table: {
        disable: true
      }
    },
    onChangeEnd: {
      table: {
        disable: true
      }
    }
  }
};

export default meta;

const Template: StoryFn<SpectrumColorAreaProps> = (args) => (
  <ColorAreaExample {...args} />
);

function ColorAreaExample(props: SpectrumColorAreaProps) {
  let {locale} = useLocale();
  let {xChannel, yChannel, isDisabled, 'aria-label': ariaLabel} = props;
  let defaultValue = typeof props.defaultValue === 'string' ? parseColor(props.defaultValue) : props.defaultValue;
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
    <div role="group" aria-label={`${ariaLabel ? `${ariaLabel} ` : ''}${colorSpace.toUpperCase()} Color Picker`}>
      <Flex gap="size-500" alignItems="start">
        {isHue ? (
          <Flex direction="column" gap={0} alignItems="center">
            <View
              position="relative"
              width="size-2400">
              <Grid
                position="absolute"
                justifyContent="center"
                alignContent="center"
                width="100%"
                height="100%">
                <ColorArea
                  size={'size-1200'}
                  {...props}
                  value={color}
                  onChange={onChange}
                  onChangeEnd={props.onChangeEnd} />
              </Grid>
              <ColorWheel
                size={'size-2400'}
                value={color}
                onChange={onChange}
                onChangeEnd={props.onChangeEnd}
                isDisabled={isDisabled} />
            </View>
          </Flex>
        ) : (
          <Flex direction="column" gap={'size-50'} alignItems="center">
            <ColorArea
              {...props}
              value={color}
              onChange={onChange}
              onChangeEnd={props.onChangeEnd}
              isDisabled={isDisabled} />
            <ColorSlider
              value={color}
              onChange={onChange}
              onChangeEnd={props.onChangeEnd}
              channel={zChannel}
              isDisabled={isDisabled} />
          </Flex>
        )}
        <Flex direction="column" alignItems="start" gap="size-100" minWidth="size-1200">
          <ColorSwatch color={color} size="L" />
          <ColorField
            label="HEX Color"
            value={color}
            onChange={onChange}
            onKeyDown={event =>
              event.key === 'Enter' &&
              onChange((event.target as HTMLInputElement).value)
            }
            isDisabled={isDisabled}
            width="size-1200" />
          <div style={{width: '100px', height: '2lh'}}>{color.getColorName(locale)}</div>
        </Flex>
      </Flex>
    </div>
  );
}

type ColorAreaStory = ComponentStoryObj<typeof ColorArea>;

export const XBlueYGreen: ColorAreaStory = {
  render: Template,
  name: 'RGB xChannel="blue", yChannel="green"',
  args: {
    defaultValue: '#0FF',
    xChannel: 'blue',
    yChannel: 'green',
    onChange: action('onChange'),
    onChangeEnd: action('onChangeEnd')
  }
};

export const XGreenYBlue: ColorAreaStory = {
  render: Template,
  name: 'RGB xChannel="green", yChannel="blue"',
  args: {...XBlueYGreen.args, xChannel: 'green', yChannel: 'blue'}
};

export const XBlueYRed: ColorAreaStory = {
  render: Template,
  name: 'RGB xChannel="blue", yChannel="red"',
  args: {...XBlueYGreen.args, defaultValue: '#F0F', xChannel: 'blue', yChannel: 'red'}
};

export const XRedYBlue: ColorAreaStory = {
  render: Template,
  name: 'RGB xChannel="red", yChannel="blue"',
  args: {...XBlueYGreen.args, defaultValue: '#F0F', xChannel: 'red', yChannel: 'blue'}
};

export const XRedYGreen: ColorAreaStory = {
  render: Template,
  name: 'RGB xChannel="red", yChannel="green"',
  args: {...XBlueYGreen.args, defaultValue: '#FF0', xChannel: 'red', yChannel: 'green'}
};

export const XGreenYRed: ColorAreaStory = {
  render: Template,
  name: 'RGB xChannel="green", yChannel="red"',
  args: {...XBlueYGreen.args, defaultValue: '#FF0', xChannel: 'green', yChannel: 'red'}
};

export const XBlueYGreenisDisabled: ColorAreaStory = {
  render: Template,
  name: 'RGB xChannel="blue", yChannel="green", isDisabled',
  args: {...XBlueYGreen.args, isDisabled: true}
};

export const XBlueYGreenAriaLabelled: ColorAreaStory = {
  render: Template,
  name: 'RGB xChannel="blue", yChannel="green", aria-label="foo"',
  args: {...XBlueYGreen.args, 'aria-label': 'foo'}
};

export const XBlueYGreenSize3000: ColorAreaStory = {
  render: Template,
  name: 'RGB xChannel="blue", yChannel="green", size="size-3000"',
  args: {...XBlueYGreen.args, size: 'size-3000'}
};

export const XBlueYGreenSize600: ColorAreaStory = {
  render: Template,
  name: 'RGB xChannel="blue", yChannel="green", size="size-600"',
  args: {...XBlueYGreen.args, size: 'size-600'}
};

export const XSaturationYLightness: ColorAreaStory = {
  render: Template,
  name: 'HSL xChannel="saturation", yChannel="lightness"',
  args: {
    ...XBlueYGreen.args,
    xChannel: 'saturation',
    yChannel: 'lightness',
    defaultValue: 'hsl(0, 100%, 50%)'
  }
};

export const XLightnessYSaturation: ColorAreaStory = {
  render: Template,
  name: 'HSL xChannel="lightness", yChannel="saturation"',
  args: {
    ...XBlueYGreen.args,
    xChannel: 'lightness',
    yChannel: 'saturation',
    defaultValue: 'hsl(0, 100%, 50%)'
  }
};

export const XSaturationYLightnessisDisabled: ColorAreaStory = {
  render: Template,
  name: 'HSL xChannel="saturation", yChannel="lightness", isDisabled',
  args: {...XSaturationYLightness.args, isDisabled: true}
};

export const XHueYSaturationHSL: ColorAreaStory = {
  render: Template,
  name: 'HSL xChannel="hue", yChannel="saturation"',
  args: {
    ...XSaturationYLightness.args,
    xChannel: 'hue',
    yChannel: 'saturation',
    defaultValue: 'hsl(0, 100%, 50%)'
  }
};

export const XSaturationYHueHSL: ColorAreaStory = {
  render: Template,
  name: 'HSL xChannel="saturation", yChannel="hue"',
  args: {
    ...XSaturationYLightness.args,
    xChannel: 'saturation',
    yChannel: 'hue',
    defaultValue: 'hsl(0, 100%, 50%)'
  }
};

export const XHueYSaturationHSLisDisabled: ColorAreaStory = {
  render: Template,
  name: 'HSL xChannel="hue", yChannel="saturation", isDisabled',
  args: {...XHueYSaturationHSL.args, isDisabled: true}
};

export const XHueYLightnessHSL: ColorAreaStory = {
  render: Template,
  name: 'HSL xChannel="hue", yChannel="lightness"',
  args: {
    ...XHueYSaturationHSL.args,
    xChannel: 'hue',
    yChannel: 'lightness',
    defaultValue: 'hsl(0, 100%, 50%)'
  }
};

export const XLightnessYHueHSL: ColorAreaStory = {
  render: Template,
  name: 'HSL xChannel="lightness", yChannel="hue"',
  args: {
    ...XHueYSaturationHSL.args,
    xChannel: 'lightness',
    yChannel: 'hue',
    defaultValue: 'hsl(0, 100%, 50%)'
  }
};

export const XHueYLightnessHSLisDisabled: ColorAreaStory = {
  render: Template,
  name: 'HSL xChannel="hue", yChannel="lightness", isDisabled',
  args: {...XHueYLightnessHSL.args, isDisabled: true}
};

export const XSaturationYBrightness: ColorAreaStory = {
  render: Template,
  name: 'HSB xChannel="saturation", yChannel="brightness"',
  args: {
    ...XHueYSaturationHSL.args,
    xChannel: 'saturation',
    yChannel: 'brightness',
    defaultValue: 'hsb(0, 100%, 100%)'
  }
};

export const XBrightnessYSaturation: ColorAreaStory = {
  render: Template,
  name: 'HSB xChannel="brightness", yChannel="saturation"',
  args: {
    ...XHueYSaturationHSL.args,
    xChannel: 'brightness',
    yChannel: 'saturation',
    defaultValue: 'hsb(0, 100%, 100%)'
  }
};

export const XSaturationYBrightnessisDisabled: ColorAreaStory = {
  render: Template,
  name: 'HSB xChannel="saturation", yChannel="brightness", isDisabled',
  args: {...XSaturationYBrightness.args, isDisabled: true}
};

export const XHueYSaturationHSB: ColorAreaStory = {
  render: Template,
  name: 'HSB xChannel="hue", yChannel="saturation"',
  args: {
    ...XSaturationYBrightness.args,
    xChannel: 'hue',
    yChannel: 'saturation',
    defaultValue: 'hsb(0, 100%, 100%)'
  }
};

export const XSaturationYHueHS: ColorAreaStory = {
  render: Template,
  name: 'HSB xChannel="saturation", yChannel="hue"',
  args: {
    ...XSaturationYBrightness.args,
    xChannel: 'saturation',
    yChannel: 'hue',
    defaultValue: 'hsb(0, 100%, 100%)'
  }
};

export const XHueYSaturationHSBisDisabled: ColorAreaStory = {
  render: Template,
  name: 'HSB xChannel="hue", yChannel="saturation", isDisabled',
  args: {...XHueYSaturationHSB.args, isDisabled: true}
};

export const XHueYBrightnessHSB: ColorAreaStory = {
  render: Template,
  name: 'HSB xChannel="hue", yChannel="brightness"',
  args: {
    ...XHueYSaturationHSB.args,
    xChannel: 'hue',
    yChannel: 'brightness',
    defaultValue: 'hsb(0, 100%, 100%)'
  }
};

export const XBrightnessYHueHSB: ColorAreaStory = {
  render: Template,
  name: 'HSB xChannel="brightness", yChannel="hue"',
  args: {
    ...XHueYSaturationHSB.args,
    xChannel: 'brightness',
    yChannel: 'hue',
    defaultValue: 'hsb(0, 100%, 100%)'
  }
};

export const XBrightnessYHueHSBisDisabled: ColorAreaStory = {
  render: Template,
  name: 'HSB xChannel="brightness", yChannel="hue", isDisabled',
  args: {...XBrightnessYHueHSB.args, isDisabled: true}
};
