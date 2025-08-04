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

import {Checkbox, CheckboxGroup} from '@react-spectrum/checkbox';
import {ComboBox} from '@react-spectrum/combobox';
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Form} from '../';
import {Heading} from '@react-spectrum/text';
import {Item, Picker} from '@react-spectrum/picker';
import {Meta, StoryObj} from '@storybook/react';
import {NumberField} from '@react-spectrum/numberfield';
import {Radio, RadioGroup} from '@react-spectrum/radio';
import React, {JSX} from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import {SpectrumFormProps} from '@react-types/form';
import {TextArea, TextField} from '@react-spectrum/textfield';

const meta: Meta<SpectrumFormProps> = {
  title: 'Form',
  component: Form
} as Meta<typeof Form>;

export default meta;

export type FormStory = StoryObj<typeof Form>;

let flatOptions = [
  {id: 1, name: 'Aardvark'},
  {id: 2, name: 'Kangaroo'},
  {id: 3, name: 'Snake'}
];

const Template = (args: SpectrumFormProps): JSX.Element => (
  <Form {...args}>
    <CheckboxGroup defaultValue={['dragons']} label="Pets">
      <Checkbox value="dogs">Dogs</Checkbox>
      <Checkbox value="cats">Cats</Checkbox>
      <Checkbox value="dragons">Dragons</Checkbox>
    </CheckboxGroup>
    <ComboBox label="More Animals">
      <Item key="red panda">Red Panda</Item>
      <Item key="aardvark">Aardvark</Item>
      <Item key="kangaroo">Kangaroo</Item>
      <Item key="snake">Snake</Item>
    </ComboBox>
    <NumberField label="Test" />
    <Picker label="Animals" placeholder="Choose an animal" items={flatOptions}>
      {item => <Item key={item.id}>{item.name}</Item>}
    </Picker>
    <RadioGroup defaultValue="dragons" label="Favorite pet" name="favorite-pet-group">
      <Radio value="dogs">Dogs</Radio>
      <Radio value="cats">Cats</Radio>
      <Radio value="dragons">Dragons</Radio>
    </RadioGroup>
    <SearchField label="Search" />
    <TextArea label="Comments" placeholder="How do you feel?" />
    <TextField
      label="City"
      placeholder="San Francisco"
      contextualHelp={(
        <ContextualHelp>
          <Heading>What is a segment?</Heading>
          <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
        </ContextualHelp>
      )} />
  </Form>
);

export const Default: FormStory = {
  render: (args) => <Template {...args} />,
  name: 'default',
  args: {}
};

export const LabelPositionSide: FormStory = {
  render: (args) => <Template {...args} />,
  name: 'label position: side',
  args: {...Default.args, labelPosition: 'side'}
};

export const LabelAlignEnd: FormStory = {
  render: (args) => <Template {...args} />,
  name: 'label align: end',
  args: {...Default.args, labelAlign: 'end'}
};

export const LabelAlignSideEnd: FormStory = {
  render: (args) => <Template {...args} />,
  name: 'label position: side, label align: end',
  args: {...Default.args, labelPosition: 'side', labelAlign: 'end'}
};

export const Required: FormStory = {
  render: (args) => <Template {...args} />,
  name: 'isRequired',
  args: {...Default.args, isRequired: true}
};

export const NecessityIndicatorLabel: FormStory = {
  render: (args) => <Template {...args} />,
  name: 'necessity indicator: label',
  args: {...Default.args, necessityIndicator: 'label'}
};

export const Quiet: FormStory = {
  render: (args) => <Template {...args} />,
  name: 'isQuiet',
  args: {...Default.args, isQuiet: true}
};

export const Emphasized: FormStory = {
  render: (args) => <Template {...args} />,
  name: 'isEmphasized',
  args: {...Default.args, isEmphasized: true}
};

export const Disabled: FormStory = {
  render: (args) => <Template {...args} />,
  name: 'isDisabled',
  args: {...Default.args, isDisabled: true}
};

export const ReadOnly: FormStory = {
  render: (args) => <Template {...args} />,
  name: 'isReadOnly',
  args: {...Default.args, isReadOnly: true}
};

export const ValidationStateInvalid: FormStory = {
  render: (args) => <Template {...args} />,
  name: 'validationState: invalid',
  args: {...Default.args, validationState: 'invalid'}
};

export const ValidationStateValid: FormStory = {
  render: (args) => <Template {...args} />,
  name: 'validationState: valid',
  args: {...Default.args, validationState: 'valid'}
};
