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

import {Color} from '@react-stately/color';
import {ColorThumb} from '../src/ColorThumb';
import {ColorWheel} from '../';
import {Flex} from '@adobe/react-spectrum';
import React, {useState} from 'react';
import {SpectrumColorWheelProps} from '@react-types/color';
import {storiesOf} from '@storybook/react';

storiesOf('ColorThumb', module)
  .add(
    'default',
    () => <ColorThumb value={new Color('#f00')} />
  )
  .add(
    'focused',
    () => <ColorThumb value={new Color('#f00')} isFocused />
  )
  .add(
    'focused, dragging',
    () => <ColorThumb value={new Color('#f00')} isFocused isDragging />
  )
  .add(
    'focused, dragging, alpha',
    () => <ColorThumb value={new Color('hsla(0, 100%, 100%, 0)')} isFocused isDragging />
  )
  .add(
    'disabled',
    () => <ColorThumb value={new Color('#f00')} isDisabled />
  );


storiesOf('ColorWheel', module)
  .add(
    'default',
    () => <ColorWheel defaultValue={new Color('#f00')} channel={'red'} />
  )
  .add(
    'disabled',
    () => <ColorWheel isDisabled defaultValue={new Color('#f07')} channel={'red'} />
  )
  .add(
    '* custom size',
    () => <ColorWheel defaultValue={new Color('#f07')} channel={'red'} />
  )
  .add(
    'controlled',
    () => {
      let [color, setColor] = useState(new Color('#ffffff'));
      return <ColorWheel value={color} onChange={setColor} channel={'red'} />;
    }
  );

storiesOf('ColorWheel/rgb', module)
  .add(
    'rgba',
    () =>  {
      let [color, setColor] = useState(new Color('#f0f'));
      let colorCSS = color.toString('css');
      return (<Flex gap={'size-500'} direction="row" alignItems="center">
        <ColorWheel onChange={setColor} value={color} channel="red" />
        <ColorWheel onChange={setColor} value={color} channel="green" />
        <ColorWheel onChange={setColor} value={color} channel="blue" />
        <ColorWheel onChange={setColor} value={color} channel="alpha" />
        <div style={{width: '50px', height: '50px', backgroundColor: colorCSS, border: '1px solid black'}} />
      </Flex>);
    }
  )
  .add(
    'red',
    () => <Component defaultValue={new Color('#fff')} channel="red" />
  )
  .add(
    'green',
    () => <Component defaultValue={new Color('#fff')} channel="green" />
  )
  .add(
    'blue',
    () => <Component defaultValue={new Color('#fff')} channel="blue" />
  )
  .add(
    'alpha',
    () => <Component defaultValue={new Color('#fff')} channel="alpha" />
  );

storiesOf('ColorWheel/hsl', module)
  .add(
    'hsla',
    () =>  {
      let [color, setColor] = useState(new Color('hsl(270, 100%, 50%)'));
      let colorCSS = color.toString('css');
      return (<Flex gap={'size-500'} direction="row" alignItems="center">
        <ColorWheel onChange={setColor} value={color} channel="hue" />
        <ColorWheel onChange={setColor} value={color} channel="saturation" />
        <ColorWheel onChange={setColor} value={color} channel="lightness" />
        <ColorWheel onChange={setColor} value={color} channel="alpha" />
        <div style={{width: '50px', height: '50px', backgroundColor: colorCSS, border: '1px solid black'}} />
      </Flex>);
    }
  )
  .add(
    'hue',
    () => <Component defaultValue={new Color('hsl(270, 100%, 50%)')} channel="hue" />
  )
  .add(
    'saturation',
    () => <Component defaultValue={new Color('hsl(270, 100%, 50%)')} channel="saturation" />
  )
  .add(
    'lightness',
    () => <Component defaultValue={new Color('hsl(270, 100%, 50%)')} channel="lightness" />
  )
  .add(
    'alpha',
    () => <Component defaultValue={new Color('hsl(270, 100%, 50%)')} channel="alpha" />
  );

function Component({defaultValue, ...props}: SpectrumColorWheelProps) {
  let [color, setColor] = useState(defaultValue);
  let colorCSS = color.toString('css');
  return (<Flex gap={'size-500'} direction="row" alignItems="center">
    <ColorWheel onChange={setColor} value={color} {...props} />
    <div style={{width: '50px', height: '50px', backgroundColor: colorCSS, border: '1px solid black'}} />
  </Flex>);
}
