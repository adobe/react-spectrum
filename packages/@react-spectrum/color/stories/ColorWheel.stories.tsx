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
import {ColorSwatch, ColorWheel} from '../';
import {Flex, SpectrumColorWheelProps, useLocale} from '@adobe/react-spectrum';
import {Meta, StoryFn, StoryObj} from '@storybook/react';
import {parseColor} from '@react-stately/color';
import React, {JSX, useState} from 'react';

export type ColorWheelStory = StoryObj<typeof ColorWheel>;

export default {
  title: 'ColorWheel',
  component: ColorWheel,
  args: {
    onChange: action('onChange'),
    onChangeEnd: action('onChangeEnd')
  },
  argTypes: {
    onChange: {
      table: {
        disable: true
      }
    },
    onChangeEnd: {
      table: {
        disable: true
      }
    },
    isDisabled: {
      control: 'boolean'
    },
    size: {
      control: 'text'
    }
  }
} as Meta<typeof ColorWheel>;

export const Default: ColorWheelStory = {
  args: {defaultValue: 'hsl(0, 100%, 50%)'},
  render: (args) => <ColorWheel {...args} />
};

export const Controlled: ColorWheelStory = {
  render: (args) => (
    <Flex gap={'size-500'} direction="row" alignItems="center">
      <ControlledHSLRender {...args} />
    </Flex>
  )
};

export const ControlledHSLRender = (props: SpectrumColorWheelProps): JSX.Element => {
  let {locale} = useLocale();
  let [color, setColor] = useState(parseColor('hsl(0, 100%, 50%)'));
  let onChangeEnd = (color) => {
    props.onChangeEnd && props.onChangeEnd(color);
    setColor(color);
  };
  let onChange = (color) => {
    props.onChange && props.onChange(color);
    setColor(color);
  };
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <ColorWheel onChange={onChange} onChangeEnd={onChangeEnd} value={color.toString('hsl')} />
      <ColorSwatch color={color} size="L" />
      <div>{color.getColorName(locale)}</div>
    </div>
  );
};

export const ControlledHSL: StoryFn<typeof ColorWheel> = (props) => <ControlledHSLRender {...props} />;
