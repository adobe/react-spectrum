/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button, FieldError, Group, Input, Label, NumberField, NumberFieldProps} from 'react-aria-components';
import {Meta, StoryObj} from '@storybook/react';
import React, {useState} from 'react';
import './styles.css';

export default {
  title: 'React Aria Components/NumberField',
  component: NumberField
} as Meta<typeof NumberField>;

export type NumberFieldStory = StoryObj<typeof NumberField>;

export const NumberFieldExample: NumberFieldStory = {
  args: {
    defaultValue: 0,
    minValue: 0,
    maxValue: 100,
    step: 1,
    formatOptions: {style: 'currency', currency: 'USD'},
    isWheelDisabled: false
  },
  render: (args) => (
    <NumberField {...args} validate={(v) => (v & 1 ? 'Invalid value' : null)}>
      <Label>Test</Label>
      <Group style={{display: 'flex'}}>
        <Button slot="decrement">-</Button>
        <Input />
        <Button slot="increment">+</Button>
      </Group>
      <FieldError />
    </NumberField>
  )
};

function NumberFieldControlled(props: NumberFieldProps) {
  const [value, setValue] = useState(props.defaultValue);
  return (
    <NumberField {...props} validate={(v) => (v & 1 ? 'Invalid value' : null)} value={value} onChange={setValue}>
      <Label>Test</Label>
      <Group style={{display: 'flex'}}>
        <Button slot="decrement">-</Button>
        <Input />
        <Button slot="increment">+</Button>
      </Group>
      <FieldError />
    </NumberField>
  );
}

export const NumberFieldControlledExample = {
  args: {
    defaultValue: 0,
    minValue: 0,
    maxValue: 100,
    step: 1,
    formatOptions: {style: 'currency', currency: 'USD'},
    isWheelDisabled: false
  },
  render: (args) => (
    <NumberFieldControlled {...args} />
  )
};
