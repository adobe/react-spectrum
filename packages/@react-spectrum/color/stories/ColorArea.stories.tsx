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
import {Flex} from '@adobe/react-spectrum';
import {parseColor} from '@react-stately/color';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/text';

storiesOf('ColorArea', module)
  .add(
    'default (HSBA xChannel="saturation" yChannel="brightness"',
    () => {
      let [color, setColor] = useState(parseColor('hsba(0, 100%, 50%, 0.5)'));
      return (<div role="group" aria-label="HSBA Color Picker">
        <Flex gap="size-500">
          <Flex direction="row" alignContent={'center'} alignItems={'center'} gap="size-200" height={'size-2000'}>
            <div style={{position: 'relative'}}>
              <ColorWheel
                value={color}
                onChange={setColor}
                UNSAFE_style={{
                  position: 'relative',
                  left: 'calc(50% - calc(var(--spectrum-global-dimension-size-125) * 8))',
                  top: 'calc(50% - calc(var(--spectrum-global-dimension-size-125) * 8))'
                }} />
              <ColorArea
                value={color}
                onChange={setColor}
                size={'size-900'}
                UNSAFE_style={{
                  position: 'absolute',
                  margin: '0',
                  left: 'calc(50% - calc(var(--spectrum-global-dimension-size-900) / 2))',
                  top: 'calc(50% - calc(var(--spectrum-global-dimension-size-900) / 2))'
                }} />
            </div>
            <ColorSlider
              value={color}
              onChange={setColor}
              channel={'alpha'}
              orientation="vertical"
              height={'size-2000'} />
            <Flex direction="column" alignItems="center" gap={'size-100'} minWidth={'size-2000'}>
              <div role="img" aria-label={`color swatch: ${color.toString('hsba')}`} style={{width: '100px', height: '100px', background: color.toString('css')}} />
              <Text>{color.toString('hsba')}</Text>
            </Flex>
          </Flex>
        </Flex>
      </div>);
    }
  )
  .add(
    'HSBA xChannel="hue", yChannel="brightness"',
    () => {
      let [color, setColor] = useState(parseColor('hsba(0, 100%, 50%, 0.5)'));
      return (<div role="group" aria-label="HSBA Color Picker">
        <Flex gap="size-500" alignItems="center">
          <Flex direction="column" gap="size-50" width={'size-2000'}>
            <ColorArea value={color} onChange={setColor} xChannel={'hue'} yChannel={'brightness'} />
            <ColorSlider value={color} onChange={setColor} channel={'saturation'} />
            <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
          </Flex>
          <Flex direction="column" alignItems="center" gap={'size-100'} minWidth={'size-2000'}>
            <div role="img" aria-label={`color swatch: ${color.toString('hsba')}`} style={{width: '100px', height: '100px', background: color.toString('css')}} />
            <Text>{color.toString('hsba')}</Text>
          </Flex>
        </Flex>
      </div>);
    }
  )
  .add(
    'HSB xChannel="hue", yChannel="saturation"',
    () => {
      let [color, setColor] = useState(parseColor('hsba(0, 100%, 50%, 0.5)'));
      return (<div role="group" aria-label="HSBA Color Picker">
        <Flex gap="size-500" alignItems="center">
          <Flex direction="column" gap="size-50" width={'size-2000'}>
            <ColorArea value={color} onChange={setColor} xChannel={'hue'} yChannel={'saturation'} />
            <ColorSlider value={color} onChange={setColor} channel={'brightness'} />
            <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
          </Flex>
          <Flex direction="column" alignItems="center" gap={'size-100'} minWidth={'size-2000'}>
            <div role="img" aria-label={`color swatch: ${color.toString('hsba')}`} style={{width: '100px', height: '100px', background: color.toString('css')}} />
            <Text>{color.toString('hsba')}</Text>
          </Flex>
        </Flex>
      </div>);
    }
  )
  .add(
    'HSBA xChannel="brightness", yChannel="hue"',
    () => {
      let [color, setColor] = useState(parseColor('hsba(0, 100%, 50%, 0.5)'));
      return (<div role="group" aria-label="HSBA Color Picker">
        <Flex gap="size-500" alignItems="center">
          <Flex direction="column" gap="size-50" width={'size-2000'}>
            <ColorArea value={color} onChange={setColor} xChannel={'brightness'} yChannel={'hue'} />
            <ColorSlider value={color} onChange={setColor} channel={'saturation'} />
            <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
          </Flex>
          <Flex direction="column" alignItems="center" gap={'size-100'} minWidth={'size-2000'}>
            <div role="img" aria-label={`color swatch: ${color.toString('hsba')}`} style={{width: '100px', height: '100px', background: color.toString('css')}} />
            <Text>{color.toString('hsba')}</Text>
          </Flex>
        </Flex>
      </div>);
    }
  )
  .add(
    'HSBA xChannel="saturation", yChannel="hue"',
    () => {
      let [color, setColor] = useState(parseColor('hsba(0, 100%, 50%, 0.5)'));
      return (<div role="group" aria-label="HSBA Color Picker">
        <Flex gap="size-500" alignItems="center">
          <Flex direction="column" gap="size-50" width={'size-2000'}>
            <ColorArea value={color} onChange={setColor} xChannel={'saturation'} yChannel={'hue'} />
            <ColorSlider value={color} onChange={setColor} channel={'brightness'} />
            <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
          </Flex>
          <Flex direction="column" alignItems="center" gap={'size-100'} minWidth={'size-2000'}>
            <div role="img" aria-label={`color swatch: ${color.toString('hsba')}`} style={{width: '100px', height: '100px', background: color.toString('css')}} />
            <Text>{color.toString('hsba')}</Text>
          </Flex>
        </Flex>
      </div>);
    }
  )
  .add(
    'RGBA xChannel="blue", yChannel="green"',
    () => {
      let [color, setColor] = useState(parseColor('#ff00ff'));
      return (<div role="group" aria-label="RGBA Color Picker">
        <Flex gap="size-500" alignItems="center">
          <Flex direction="column" gap="size-50" width={'size-2000'}>
            <ColorArea value={color} onChange={setColor} xChannel={'blue'} yChannel={'green'} />
            <ColorSlider value={color} onChange={setColor} channel={'red'} />
            <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
          </Flex>
          <Flex direction="column" alignItems="center" gap="size-100" minWidth={'size-2000'}>
            <div role="img" aria-label={`color swatch: ${color.toString('rgba')}`} style={{width: '100px', height: '100px', background: color.toString('css')}} />
            <Text>{color.toString('hexa')}</Text>
          </Flex>
        </Flex>
      </div>);
    }
  )
  .add(
    'RGBA xChannel="blue", yChannel="red"',
    () => {
      let [color, setColor] = useState(parseColor('#ff00ff'));
      return (<div role="group" aria-label="RGBA Color Picker">
        <Flex gap="size-500" alignItems="center">
          <Flex direction="column" gap="size-50" width={'size-2000'}>
            <ColorArea value={color} onChange={setColor} xChannel={'blue'} yChannel={'red'} />
            <ColorSlider value={color} onChange={setColor} channel={'green'} />
            <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
          </Flex>
          <Flex direction="column" alignItems="center" gap="size-100" minWidth={'size-2000'}>
            <div role="img" aria-label={`color swatch: ${color.toString('rgba')}`} style={{width: '100px', height: '100px', background: color.toString('css')}} />
            <Text>{color.toString('hexa')}</Text>
          </Flex>
        </Flex>
      </div>);
    }
  )
  .add(
    'RGBA xChannel="red", yChannel="green"',
    () => {
      let [color, setColor] = useState(parseColor('#ff00ff'));
      return (<div role="group" aria-label="RGBA Color Picker">
        <Flex gap="size-500" alignItems="center">
          <Flex direction="column" gap="size-50" width={'size-2000'}>
            <ColorArea value={color} onChange={setColor} xChannel={'red'} yChannel={'green'} />
            <ColorSlider value={color} onChange={setColor} channel={'blue'} />
            <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
          </Flex>
          <Flex direction="column" alignItems="center" gap="size-100" minWidth={'size-2000'}>
            <div role="img" aria-label={`color swatch: ${color.toString('rgba')}`} style={{width: '100px', height: '100px', background: color.toString('css')}} />
            <Text>{color.toString('hexa')}</Text>
          </Flex>
        </Flex>
      </div>);
    }
  )
  .add(
    'HSL xChannel="saturation", yChannel="lightness"',
    () => {
      let [color, setColor] = useState(parseColor('hsla(0, 100%, 50%, 0.5)'));
      return (<div role="group" aria-label="HSLA Color Picker">
        <Flex gap="size-500">
          <Flex direction="row" alignContent={'center'} alignItems={'center'} gap="size-200">
            <div style={{position: 'relative'}}>
              <ColorWheel
                value={color}
                onChange={setColor}
                UNSAFE_style={{
                  position: 'relative',
                  left: 'calc(50% - calc(var(--spectrum-global-dimension-size-125) * 8))',
                  top: 'calc(50% - calc(var(--spectrum-global-dimension-size-125) * 8))'
                }} />
              <ColorArea
                value={color}
                onChange={setColor}
                size={'size-900'}
                UNSAFE_style={{
                  position: 'absolute',
                  margin: '0',
                  left: 'calc(50% - calc(var(--spectrum-global-dimension-size-900, var(--spectrum-alias-size-900)) / 2))',
                  top: 'calc(50% - calc(var(--spectrum-global-dimension-size-900, var(--spectrum-alias-size-900)) / 2))'
                }} />
            </div>
            <ColorSlider value={color} onChange={setColor} channel={'alpha'} orientation="vertical" height={'size-2000'} />
            <Flex direction="column" alignItems="center" gap={'size-100'} minWidth={'size-2000'}>
              <div role="img" aria-label={`color swatch: ${color.toString('hsla')}`} style={{width: '100px', height: '100px', background: color.toString('css')}} />
              <Text>{color.toString('hsla')}</Text>
            </Flex>
          </Flex>
        </Flex>
      </div>);
    }
  )
  .add(
    'HSLA xChannel="hue", yChannel="lightness"',
    () => {
      let [color, setColor] = useState(parseColor('hsla(0, 100%, 50%, 0.5)'));
      return (<div role="group" aria-label="HSLA Color Picker">
        <Flex gap="size-500" alignItems="center">
          <Flex direction="column" gap="size-50" width={'size-2000'}>
            <ColorArea value={color} onChange={setColor} xChannel={'hue'} yChannel={'lightness'} />
            <ColorSlider value={color} onChange={setColor} channel={'saturation'} />
            <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
          </Flex>
          <Flex direction="column" alignItems="center" gap={'size-100'} minWidth={'size-2000'}>
            <div role="img" aria-label={`color swatch: ${color.toString('hsla')}`} style={{width: '100px', height: '100px', background: color.toString('css')}} />
            <Text>{color.toString('hsla')}</Text>
          </Flex>
        </Flex>
      </div>);
    }
  )
  .add(
    'HSLA xChannel="hue", yChannel="saturation"',
    () => {
      let [color, setColor] = useState(parseColor('hsla(0, 100%, 50%, 0.5)'));
      return (<div role="group" aria-label="HSLA Color Picker">
        <Flex gap="size-500" alignItems="center">
          <Flex direction="column" gap="size-50" width={'size-2000'}>
            <ColorArea value={color} onChange={setColor} xChannel={'hue'} yChannel={'saturation'} />
            <ColorSlider value={color} onChange={setColor} channel={'lightness'} />
            <ColorSlider value={color} onChange={setColor} channel={'alpha'} />
          </Flex>
          <Flex direction="column" alignItems="center" gap={'size-100'} minWidth={'size-2000'}>
            <div role="img" aria-label={`color swatch: ${color.toString('hsla')}`} style={{width: '100px', height: '100px', background: color.toString('css')}} />
            <Text>{color.toString('hsla')}</Text>
          </Flex>
        </Flex>
      </div>);
    }
  )
  .add(
    'disabled',
    () => <ColorArea isDisabled defaultValue="hsl(0, 100%, 50%)" />
  )
  .add(
    'step',
    () => <ColorArea step={6} onChange={action('change')} defaultValue="hsl(0, 100%, 50%)" />
  )
  .add(
    'custom size',
    () => {
      let [size, setSize] = useState('size-2400');
      return (<Flex direction="column" alignItems="center" gap="size-200">
        <Flex direction="row">
          <button onClick={() => setSize('size-2400')}>size-2400</button>
          <button onClick={() => setSize('size-5000')}>size-5000</button>
          <button onClick={() => setSize('50vh')}>50vh</button>
        </Flex>
        <ColorArea defaultValue="hsb(180, 100%, 100%)" size={size} onChange={action('change')} />
      </Flex>);
    }
  )
  .add(
    'controlled',
    () => {
      let [color, setColor] = useState(parseColor('hsl(0, 100%, 50%)'));
      let colorCSS = color.toString('css');
      return (<Flex gap={'size-500'} direction="row" alignItems="center">
        <ColorArea onChange={setColor} value={color} />
        <div style={{width: '50px', height: '50px', backgroundColor: colorCSS, border: '1px solid black'}} />
      </Flex>);
    }
  );
