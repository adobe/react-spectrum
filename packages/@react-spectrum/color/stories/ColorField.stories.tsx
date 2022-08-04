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
import {Color} from '@react-types/color';
import {ColorField} from '../';
import {Flex} from '@react-spectrum/layout';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {useId} from '@react-aria/utils';
import {View} from '@react-spectrum/view';
import {VisuallyHidden} from '@react-aria/visually-hidden';

const parameters = {
  args: {
    allowsAlpha: false
  },
  argTypes: {
    allowsAlpha: {
      control: {type: 'boolean'}
    }
  }
}

storiesOf('ColorField', module)
  .addParameters(parameters)
  .add(
    'Default',
    (args) => render(args)
  )
  .add(
    'has default value',
    (args) => render({...args, defaultValue: '#abcdef'})
  )
  .add(
    'value',
    (args) => render({
      ...args,
      value: '#FF00AA',
      onChange: action('change')
    })
  )
  .add(
    'isQuiet',
    (args) => render({...args, isQuiet: true})
  )
  .add(
    'isReadOnly',
    (args) => render({...args, isReadOnly: true, defaultValue: '#abcdef'})
  )
  .add(
    'isDisabled',
    (args) => render({...args, isDisabled: true, defaultValue: '#abcdef'})
  )
  .add(
    'validationState valid',
    (args) => render({...args, validationState: 'valid'})
  )
  .add(
    'validationState invalid',
    (args) => render({...args, validationState: 'invalid'})
  )
  .add(
    'required, label, optional',
    (args) => (
      <Flex direction="column" gap="size-100">
        {render({...args, isRequired: 'true'})}
        {render({...args, isRequired: 'true', necessityIndicator: 'label'})}
        {render({...args, necessityIndicator: 'label'})}
      </Flex>
    )
  )
  .add(
    'controlled value',
    (args) => (
      <ControlledColorField
        {...args}
        value="#FF00AA"
        onChange={action('change')} />
    )
  )
  .add(
    'autofocus',
    (args) => render({...args, autoFocus: true})
  )
  .add(
    'label side',
    (args) => render({...args, labelPosition: 'side'})
  )
  .add(
    'no visible label',
    (args) => renderNoLabel({...args, isRequired: true, 'aria-label': 'Primary Color'})
  )
  .add(
    'aria-labelledby',
    (args) => (
      <>
        <label htmlFor="colorfield" id="label">Primary Color</label>
        {renderNoLabel({...args, isRequired: true, id: 'colorfield', 'aria-labelledby': 'label'})}
      </>
    )
  )
  .add(
    'custom width',
    (args) => render({...args, width: 'size-3000'})
  )
  .add(
    'custom width no visible label',
    (args) => renderNoLabel({...args, width: 'size-3000', isRequired: true, 'aria-label': 'Primary Color'})
  )
  .add(
    'custom width, labelPosition=side',
    (args) => render({...args, width: 'size-3000', labelPosition: 'side'})
  )
  .add(
    'custom width, 10px for min-width',
    (args) => (
      <Flex direction="column" gap="size-100">
        {render({...args, width: '10px'})}
        <div style={{width: '10px'}}>
          {render(args)}
        </div>
      </Flex>
    )
  );

function ControlledColorField(props: any = {}) {
  let [color, setColor] = useState(props.value || null);
  let onChange = (color: Color) => {
    setColor(color);
    if (props.onChange) { props.onChange(color); }
  };
  let style = color ? {backgroundColor: color.toString('rgb')} : {};
  let id = useId();
  return (
    <Flex direction="row" gap="size-100" alignItems="end">
      <ColorField
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
    <ColorField
      label="Primary Color"
      onChange={action('change')}
      {...props} />
  );
}

function renderNoLabel(props: any = {}) {
  return (
    <ColorField {...props} onChange={action('onChange')} />
  );
}
