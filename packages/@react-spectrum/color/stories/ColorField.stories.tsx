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
import {Color, SpectrumColorFieldProps} from '@react-types/color';
import {ColorField} from '../';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Flex} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import {parseColor} from '@react-stately/color';
import React, {useState} from 'react';
import {useId} from '@react-aria/utils';
import {View} from '@react-spectrum/view';
import {VisuallyHidden} from '@react-aria/visually-hidden';

export type ColorFieldStory = ComponentStoryObj<typeof ColorField>;

export default {
  title: 'ColorField',
  component: ColorField,
  args: {
    onChange: action('onChange'),
    label: 'Primary Color'
  },
  argTypes: {
    onChange: {
      table: {
        disable: true
      }
    },
    contextualHelp: {
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
    isQuiet: {
      control: 'boolean'
    },
    isReadOnly: {
      control: 'boolean'
    },
    isDisabled: {
      control: 'boolean'
    },
    autoFocus: {
      control: 'boolean'
    },
    isRequired: {
      control: 'boolean'
    },
    necessityIndicator: {
      control: 'select',
      options: ['icon', 'label']
    },
    labelAlign: {
      control: 'select',
      options: ['end', 'start']
    },
    labelPosition: {
      control: 'select',
      options: ['top', 'side']
    },
    validationState: {
      control: 'select',
      options: [null, 'valid', 'invalid']
    },
    description: {
      control: 'text'
    },
    errorMessage: {
      control: 'text'
    },
    width: {
      control: 'text'
    }
  }
} as ComponentMeta<typeof ColorField>;

export const Default: ColorFieldStory = {
  render: (args) => render(args)
};

export const DefaultValue: ColorFieldStory = {
  ...Default,
  args: {defaultValue: '#abcdef'}
};

export const ControlledValue: ColorFieldStory = {
  render: (args) => <ControlledColorField {...args} value={parseColor('#FF00AA')} />
};

export const AriaLabelledBy: ColorFieldStory = {
  render: (args) => (
    <>
      <label htmlFor="colorfield" id="label">Primary Color</label>
      {render({...args, id: 'colorfield', 'aria-labelledby': 'label'})}
    </>
  ),
  name: 'aria-labelledy'
};

export const MinWidth: ColorFieldStory = {
  render: (args) => (
    <Flex direction="column" gap="size-100">
      {render({...args, width: '10px'})}
      <div style={{width: '10px'}}>
        {render(args)}
      </div>
    </Flex>
  ),
  name: 'custom width, 10px for min-width'
};

export const ContextualHelpStory: ColorFieldStory = {
  ...Default,
  args: {
    contextualHelp: (
      <ContextualHelp>
        <Heading>What is a segment?</Heading>
        <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
      </ContextualHelp>
    )
  },
  name: 'contextual help'
};

function ControlledColorField(props: SpectrumColorFieldProps) {
  let [color, setColor] = useState<string | Color | null | undefined>(props.value);
  let onChange = (color: Color | null) => {
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
    <ColorField {...props} />
  );
}
