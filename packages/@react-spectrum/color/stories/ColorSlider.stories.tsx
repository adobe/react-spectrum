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
import {ColorSlider, ColorSwatch} from '../';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Flex} from '@react-spectrum/layout';
import {Heading, Text} from '@react-spectrum/text';
import {parseColor} from '@react-stately/color';
import React, {useState} from 'react';
import {useLocale} from '@react-aria/i18n';

export type ColorSliderStory = ComponentStoryObj<typeof ColorSlider>;

export default {
  title: 'ColorSlider',
  component: ColorSlider,
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
    contextualHelp: {
      table: {
        disable: true
      }
    },
    channel: {
      table: {
        disable: true
      }
    },
    label: {
      control: 'text'
    },
    'aria-label': {
      control: 'text'
    },
    isDisabled: {
      control: 'boolean'
    },
    showValueLabel: {
      control: 'boolean'
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical']
    },
    width: {
      control: 'text'
    },
    height: {
      control: 'text'
    }
  }
} as ComponentMeta<typeof ColorSlider>;

export const Default: ColorSliderStory = {
  args: {defaultValue: '#800000', channel: 'red'},
  render: (args) => <ColorSlider {...args} />
};

export const Controlled: ColorSliderStory = {
  ...Default,
  args: {value: '#800000', channel: 'red'}
};

export const ContextualHelpStory: ColorSliderStory = {
  ...Default,
  args: {
    defaultValue: 'hsb(0, 100%, 50%)',
    channel: 'hue',
    contextualHelp: (
      <ContextualHelp>
        <Heading>What is Hue?</Heading>
        <Content>Hue is a degree on the color wheel from 0 to 360. 0 (or 360) is red, 120 is green, 240 is blue.</Content>
      </ContextualHelp>
    )
  },
  name: 'contextual help'
};

export const RGBA: ColorSliderStory = {
  render: (args) => <RGBASlider {...args} />
};

export const HSLA: ColorSliderStory = {
  render: (args) => <HSLASlider {...args} />
};

export const HSBA: ColorSliderStory = {
  render: (args) => <HSBASlider {...args} />
};

function RGBASlider(props) {
  let {locale} = useLocale();
  let [color, setColor] = useState(parseColor('#ff00ff'));
  let onChange = (v) => {
    setColor(v);
    props?.onChange?.(v);
  };

  return (
    <div role="group" aria-label="RGBA Color Picker">
      <Flex gap="size-500" alignItems="center">
        <Flex direction="column">
          <ColorSlider {...props} value={color} onChange={onChange} channel={'red'} />
          <ColorSlider {...props} value={color} onChange={onChange} channel={'green'} />
          <ColorSlider {...props} value={color} onChange={onChange} channel={'blue'} />
          <ColorSlider {...props} value={color} onChange={onChange} channel={'alpha'} />
        </Flex>
        <Flex direction="column" alignItems="start" gap="size-100">
          <ColorSwatch color={color} size="L" />
          <Text>{color.toString('hexa')}</Text>
          <div style={{width: '100px', height: '2lh'}}>{color.getColorName(locale)}</div>
        </Flex>
      </Flex>
    </div>
  );
}

function HSLASlider(props) {
  let {locale} = useLocale();
  let [color, setColor] = useState(parseColor('hsl(0, 100%, 50%)'));
  let onChange = (v) => {
    setColor(v);
    props?.onChange?.(v);
  };

  return (
    <div role="group" aria-label="HSLA Color Picker">
      <Flex gap="size-500" alignItems="center">
        <Flex direction="column">
          <ColorSlider {...props} value={color} onChange={onChange} channel={'hue'} />
          <ColorSlider {...props} value={color} onChange={onChange} channel={'saturation'} />
          <ColorSlider {...props} value={color} onChange={onChange} channel={'lightness'} />
          <ColorSlider {...props} value={color} onChange={onChange} channel={'alpha'} />
        </Flex>
        <Flex direction="column" alignItems="start" gap="size-100">
          <ColorSwatch color={color} size="L" />
          <div style={{width: '100px', height: '2lh'}}>{color.getColorName(locale)}</div>
        </Flex>
      </Flex>
    </div>
  );
}

function HSBASlider(props) {
  let {locale} = useLocale();
  let [color, setColor] = useState(parseColor('hsb(0, 100%, 50%)'));
  let onChange = (v) => {
    setColor(v);
    props?.onChange?.(v);
  };

  return (
    <div role="group" aria-label="HSBA Color Picker">
      <Flex gap="size-500" alignItems="center">
        <Flex direction="column">
          <ColorSlider {...props} value={color} onChange={onChange} channel={'hue'} />
          <ColorSlider {...props} value={color} onChange={onChange} channel={'saturation'} />
          <ColorSlider {...props} value={color} onChange={onChange} channel={'brightness'} />
          <ColorSlider {...props} value={color} onChange={onChange} channel={'alpha'} />
        </Flex>
        <Flex direction="column" alignItems="start" gap="size-100">
          <ColorSwatch color={color} size="L" />
          <div style={{width: '100px', height: '2lh'}}>{color.getColorName(locale)}</div>
        </Flex>
      </Flex>
    </div>
  );
}
