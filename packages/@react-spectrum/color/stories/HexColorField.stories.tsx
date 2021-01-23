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
import {Color} from '@react-types/color';
import {Content, View} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Flex} from '@react-spectrum/layout';
import {HexColorField} from '../';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {useId} from '@react-aria/utils';
import {VisuallyHidden} from '@react-aria/visually-hidden';

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
        value="#FF00AA"
        onChange={action('change')} />
    )
  )
  .add(
    'as a popover',
    () => (
      <HexColorFieldPopover
        label="Choose a color"
        value="#ff0000"
        step={256}
        onChange={action('change')} />
    )
  )
  .add(
    'as a popover, defaults only',
    () => <HexColorFieldPopover onChange={action('change')} />
  );

function HexColorFieldPopover(props: any = {}) {
  let [color, setColor] = useState(props.value ? new Color(props.value) : null);
  let colorString = color ? color.toString('hex') : '';

  function getForegroundColorString(color: Color) {
    if (!color) {
      return 'currentColor';
    }
  
    const black = new Color('#000000');
    const white = new Color('#FFFFFF');
  
    return color.contrast(white) > color.contrast(black)
      ? white.toString('hex')
      : black.toString('hex');
  }

  return (
    <DialogTrigger type="popover">
      <ActionButton
        width="size-1600"
        height="size-1600"
        aria-label={colorString ? `Primary color: ${colorString}` : 'Primary color'}
        UNSAFE_style={{
          background: colorString,
          color: getForegroundColorString(color)
        }}>
        {colorString}
      </ActionButton>
      <Dialog width="size-3600">
        <Content>
          {render({
            ...props,
            autoFocus: true,
            value: color,
            onChange: (newColor: Color) => {
              setColor(newColor);
              if (props.onChange) { props.onChange(newColor); }
            }
          })}
        </Content>
      </Dialog>
    </DialogTrigger>
  );
}

function ControlledHexColorField(props: any = {}) {
  let [color, setColor] = useState(props.value || null);
  let onChange = (color: Color) => {
    setColor(color);
    if (props.onChange) { props.onChange(color); }
  };
  let style = color ? {backgroundColor: color.toString('rgb')} : {};
  let id = useId();
  return (
    <Flex direction="row" gap="size-100" alignItems="end">
      <HexColorField
        id={id}
        label="Primary Color"
        onChange={onChange}
        value={color} />
      <View width="size-400" height="size-400" UNSAFE_style={style}>
        <VisuallyHidden>
          <output htmlFor={id} aria-live="off">
            {color ? color.toString('hex') : ''}
          </output>
        </VisuallyHidden>
      </View>
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
