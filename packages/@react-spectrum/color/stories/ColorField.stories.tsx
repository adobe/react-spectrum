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
import {useId} from '@react-aria/utils';
import {View} from '@react-spectrum/view';
import {VisuallyHidden} from '@react-aria/visually-hidden';

export default {
  title: 'ColorField'
};

export const Default = () => render();
export const HasDefaultValue = () => render({defaultValue: '#abcdef'});

HasDefaultValue.story = {
  name: 'has default value'
};

export const Value = () =>
  render({
    value: '#FF00AA',
    onChange: action('change')
  });

Value.story = {
  name: 'value'
};

export const IsQuiet = () => render({isQuiet: true});

IsQuiet.story = {
  name: 'isQuiet'
};

export const IsReadOnly = () =>
  render({isReadOnly: true, defaultValue: '#abcdef'});

IsReadOnly.story = {
  name: 'isReadOnly'
};

export const IsDisabled = () =>
  render({isDisabled: true, defaultValue: '#abcdef'});

IsDisabled.story = {
  name: 'isDisabled'
};

export const ValidationStateValid = () => render({validationState: 'valid'});

ValidationStateValid.story = {
  name: 'validationState valid'
};

export const ValidationStateInvalid = () =>
  render({validationState: 'invalid'});

ValidationStateInvalid.story = {
  name: 'validationState invalid'
};

export const RequiredLabelOptional = () => (
  <Flex direction="column" gap="size-100">
    {render({isRequired: 'true'})}
    {render({isRequired: 'true', necessityIndicator: 'label'})}
    {render({necessityIndicator: 'label'})}
  </Flex>
);

RequiredLabelOptional.story = {
  name: 'required, label, optional'
};

export const WithPlaceholder = () =>
  render({placeholder: 'Enter a hex color'});

WithPlaceholder.story = {
  name: 'with placeholder'
};

export const Step16 = () => render({step: 16});

Step16.story = {
  name: 'step = 16'
};

export const ControlledValue = () => (
  <ControlledColorField value="#FF00AA" onChange={action('change')} />
);

ControlledValue.story = {
  name: 'controlled value'
};

export const Autofocus = () => render({autoFocus: true});

Autofocus.story = {
  name: 'autofocus'
};

export const Placeholder = () => render({placeholder: '#e73623'});

Placeholder.story = {
  name: 'placeholder'
};

export const LabelSide = () => render({labelPosition: 'side'});

LabelSide.story = {
  name: 'label side'
};

export const NoVisibleLabel = () =>
  renderNoLabel({isRequired: true, 'aria-label': 'Primary Color'});

NoVisibleLabel.story = {
  name: 'no visible label'
};

export const AriaLabelledby = () => (
  <>
    <label htmlFor="colorfield" id="label">
      Primary Color
    </label>
    {renderNoLabel({
      isRequired: true,
      id: 'colorfield',
      'aria-labelledby': 'label'
    })}
  </>
);

AriaLabelledby.story = {
  name: 'aria-labelledby'
};

export const CustomWidth = () => render({width: 'size-3000'});

CustomWidth.story = {
  name: 'custom width'
};

export const CustomWidthNoVisibleLabel = () =>
  renderNoLabel({
    width: 'size-3000',
    isRequired: true,
    'aria-label': 'Primary Color'
  });

CustomWidthNoVisibleLabel.story = {
  name: 'custom width no visible label'
};

export const CustomWidthLabelPositionSide = () =>
  render({width: 'size-3000', labelPosition: 'side'});

CustomWidthLabelPositionSide.story = {
  name: 'custom width, labelPosition=side'
};

export const CustomWidth10PxForMinWidth = () => (
  <Flex direction="column" gap="size-100">
    {render({width: '10px'})}
    <div style={{width: '10px'}}>{render()}</div>
  </Flex>
);

CustomWidth10PxForMinWidth.story = {
  name: 'custom width, 10px for min-width'
};

function ControlledColorField(props: any = {}) {
  let [color, setColor] = useState(props.value || null);
  let onChange = (color: Color) => {
    setColor(color);
    if (props.onChange) {
      props.onChange(color);
    }
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
    <ColorField label="Primary Color" onChange={action('change')} {...props} />
  );
}

function renderNoLabel(props: any = {}) {
  return <ColorField {...props} onChange={action('onChange')} />;
}
