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
import {ColorSlider} from '../';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Flex} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import {parseColor} from '@react-stately/color';
import React, {useState} from 'react';
import {Text} from '@react-spectrum/text';

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
        <Heading>What is a segment?</Heading>
        <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
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
        <Flex direction="column" alignItems="center"gap="size-100">
          <div style={{width: '100px', height: '100px', background: color.toString('css')}} />
          <Text>{color.toString('hexa')}</Text>
        </Flex>
      </Flex>
    </div>
  );
}

function HSLASlider(props) {
  let [color, setColor] = useState(parseColor('hsla(0, 100%, 50%, 0.5)'));
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
        <Flex direction="column" alignItems="center" gap="size-100">
          <div style={{width: '100px', height: '100px', background: color.toString('css')}} />
        </Flex>
      </Flex>
    </div>
  );
}

function HSBASlider(props) {
  let [color, setColor] = useState(parseColor('hsba(0, 100%, 50%, 0.5)'));
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
        <Flex direction="column" alignItems="center" gap="size-100">
          <div style={{width: '100px', height: '100px', background: color.toString('css')}} />
        </Flex>
      </Flex>
    </div>
  );
}
