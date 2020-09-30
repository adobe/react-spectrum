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
import {ActionButton} from '@react-spectrum/button';
import {Color} from '@react-stately/color';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Flex} from '@react-spectrum/layout';
import {HexColorField} from '../';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {View} from '@react-spectrum/view';

storiesOf('HexColorField', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'has default value',
    () => render({defaultValue: '#abcdef'})
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'isReadOnly',
    () => render({isReadOnly: true, defaultValue: '#abcdef'})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true, defaultValue: '#abcdef'})
  )
  .add(
    'validationState valid',
    () => render({validationState: 'valid'})
  )
  .add(
    'validationState invalid',
    () => render({validationState: 'invalid'})
  )
  .add(
    'with placeholder',
    () => render({placeholder: 'Enter a hex color'})
  )
  .add(
    'step = 16',
    () => render({step: 16})
  )
  .add(
    'controlled value',
    () => (
      <ControlledHexColorField
        value={new Color('#FF00AA')}
        onChange={action('change')} />
    )
  )
  .add(
    'as a popover',
    () => (
      <HexColorFieldPopover
        label="Choose a color"
        value="#ff0000"
        step={255}
        onChange={action('change')} />
    )
  )
  .add(
    'as a popover, defaults only',
    () => <HexColorFieldPopover onChange={action('change')} />
  );

function HexColorFieldPopover(props: any = {}) {
  let [color, setColor] = useState(props.value);
  let colorString = color ? color.toString('hex') : '';
  return (
    <DialogTrigger type="popover">
      <ActionButton
        width="size-1600"
        height="size-1600"
        UNSAFE_style={{
          background: colorString
        }} >{colorString}</ActionButton>
      <Dialog 
        width="size-3600"
        height="size-1600" >
        <View padding="size-300">
          {render({
            ...props,
            value: color,
            onChange: (newColor: Color) => {
              setColor(newColor);
              if (props.onChange) { props.onChange(newColor); }
            }
          })}
        </View>
      </Dialog>
    </DialogTrigger>
  );
}

function ControlledHexColorField(props: any = {}) {
  let [color, setColor] = useState(props.value);
  let onChange = (color: Color) => {
    setColor(color);
    if (props.onChange) { props.onChange(color); }
  };
  return (
    <Flex direction="row" gap="size-100" alignItems="end">
      <HexColorField
        label="Primary Color"
        onChange={onChange}
        value={color} />
      <View width="size-400" height="size-400" UNSAFE_style={{backgroundColor: color.toString('rgb')}} />
    </Flex>
  );
}

function render(props: any = {}) {
  return (
    <HexColorField
      label="Primary Color"
      onChange={action('change')}
      {...props} />
  );
}
