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

import {ActionButton} from '@react-spectrum/button';
import {Color} from '@react-stately/color';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
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
    'min = #AAAAAA, max = #CCCCCC',
    () => render({minValue: '#AAA', maxValue: '#CCC'})
  )
  .add(
    'as a popover',
    () => {
      const initialColor = new Color('#ff0000');
      const [color, setColor] = useState(initialColor);
      return (
        <DialogTrigger type="popover">
          <ActionButton
            width="size-500"
            height="size-500"
            UNSAFE_style={{
              background: color.toString('hex')
            }}
          ></ActionButton>
          <Dialog 
            width='size-3600'
            height='size-1600'
          >
            <View padding='size-300'>
              {render({
                label: 'Choose a color',
                value: color,
                onChange: (newColor) => setColor(newColor.toString('hex'))
              })}
            </View>
          </Dialog>
        </DialogTrigger>
      );
    }
  );

function render(props: any = {}) {
  return (
    <HexColorField
      label={'Primary Color'}
      {...props} />
  );
}
