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

import {ColorSlider} from '../';
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Flex} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import {parseColor} from '@react-stately/color';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/text';

storiesOf('ColorSlider', module)
  .addParameters({
    args: {
      label: undefined,
      isDisabled: false
    },
    argTypes: {
      label: {
        control: {
          type: 'text'
        }
      }
    }
  })
  .add(
    'default',
    args => <ColorSlider {...args} defaultValue="#800000" channel={'red'} />
  )
  .add(
    'no label, default aria-label',
    args => <ColorSlider {...args} defaultValue="#800000" channel={'red'} label={null} />
  )
  .add(
    'no value label',
    args => <ColorSlider {...args} defaultValue="#800000" channel={'red'} showValueLabel={false} />
  )
  .add(
    'custom aria-label',
    args => <ColorSlider {...args} defaultValue="#800000" channel={'red'} aria-label="Color Picker Channel: Red" />
  )
  .add(
    'vertical',
    args => <ColorSlider {...args} defaultValue="#ff0000" channel={'red'} orientation="vertical" />
  )
  .add(
    'controlled',
    args => <ColorSlider {...args} value="#ff0000" channel={'red'} />
  )
  .add(
    'custom width',
    args => <ColorSlider {...args} defaultValue="#800000" channel={'red'} width={300} />
  )
  .add(
    'custom height',
    args => <ColorSlider {...args} defaultValue="#800000" channel={'red'} orientation="vertical" height={300} />
  )
  .add(
    'contextual help',
    args => (
      <ColorSlider
        {...args}
        channel="hue"
        defaultValue="hsb(0, 100%, 50%)"
        contextualHelp={(
          <ContextualHelp>
            <Heading>What is a segment?</Heading>
            <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
          </ContextualHelp>
        )} />
    )
  )
  .add(
    'rgba',
    args => {
      let [color, setColor] = useState(parseColor('#ff00ff'));
      return (<div role="group" aria-label="RGBA Color Picker">
        <Flex gap="size-500" alignItems="center">
          <Flex direction="column">
            <ColorSlider {...args} value={color} onChange={setColor} channel={'red'} />
            <ColorSlider {...args} value={color} onChange={setColor} channel={'green'} />
            <ColorSlider {...args} value={color} onChange={setColor} channel={'blue'} />
            <ColorSlider {...args} value={color} onChange={setColor} channel={'alpha'} />
          </Flex>
          <Flex direction="column" alignItems="center"gap="size-100">
            <div style={{width: '100px', height: '100px', background: color.toString('css')}} />
            <Text>{color.toString('hexa')}</Text>
          </Flex>
        </Flex>
      </div>);
    }
  )
  .add(
    'hsla',
    args => {
      let [color, setColor] = useState(parseColor('hsla(0, 100%, 50%, 0.5)'));
      return (<div role="group" aria-label="HSLA Color Picker">
        <Flex gap="size-500" alignItems="center">
          <Flex direction="column">
            <ColorSlider {...args} value={color} onChange={setColor} channel={'hue'} />
            <ColorSlider {...args} value={color} onChange={setColor} channel={'saturation'} />
            <ColorSlider {...args} value={color} onChange={setColor} channel={'lightness'} />
            <ColorSlider {...args} value={color} onChange={setColor} channel={'alpha'} />
          </Flex>
          <Flex direction="column" alignItems="center" gap="size-100">
            <div style={{width: '100px', height: '100px', background: color.toString('css')}} />
          </Flex>
        </Flex>
      </div>);
    }
  )
  .add(
    'hsba',
    args => {
      let [color, setColor] = useState(parseColor('hsba(0, 100%, 50%, 0.5)'));
      return (<div role="group" aria-label="HSBA Color Picker">
        <Flex gap="size-500" alignItems="center">
          <Flex direction="column">
            <ColorSlider {...args} value={color} onChange={setColor} channel={'hue'} />
            <ColorSlider {...args} value={color} onChange={setColor} channel={'saturation'} />
            <ColorSlider {...args} value={color} onChange={setColor} channel={'brightness'} />
            <ColorSlider {...args} value={color} onChange={setColor} channel={'alpha'} />
          </Flex>
          <Flex direction="column" alignItems="center" gap="size-100">
            <div style={{width: '100px', height: '100px', background: color.toString('css')}} />
          </Flex>
        </Flex>
      </div>);
    }
  );
