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
import {ColorField} from '@react-spectrum/color';
import {ComboBox} from '@react-spectrum/combobox';
import {Form} from '../';
import {Item, Picker} from '@react-spectrum/picker';
import {Meta} from '@storybook/react';
import {NumberField} from '@react-spectrum/numberfield';
import {Radio, RadioGroup} from '@react-spectrum/radio';
import React from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import {SpectrumFormProps} from '@react-types/form';
import {TextArea, TextField} from '@react-spectrum/textfield';

const meta: Meta<SpectrumFormProps> = {
  title: 'Form/LongLabel',
  component: Form
};

export default meta;

let flatOptions = [
  {id: 1, name: 'Aardvark'},
  {id: 2, name: 'Kangaroo'},
  {id: 3, name: 'Snake'}
];

const Template = (args) => (
  <Form {...args}>
    <CheckboxGroup defaultValue={['dragons']} label="Pets are family fun for all, two real and two fantasy">
      <Checkbox value="dogs">Dogs</Checkbox>
      <Checkbox value="cats">Cats</Checkbox>
      <Checkbox value="dragons">Dragons</Checkbox>
      <Checkbox value="dragons">Ringu the five headed metallic dragon of gold, silver, bronze, copper, and brass</Checkbox>
    </CheckboxGroup>
    <ColorField label="Pick our favorite color as long as it is Adobe red" />
    <ComboBox label="Combobox pick a number as long as it is one, two or three">
      <Item key="one">One</Item>
      <Item key="two">Two</Item>
      <Item key="three">Three</Item>
    </ComboBox>
    <NumberField label="Pick a number any number, guess right and you win nothing!!!!!!" />
    <Picker label="Animals, just three of them because why not more and not less" placeholder="Choose an animal" items={flatOptions}>
      {item => <Item key={item.id}>{item.name}</Item>}
    </Picker>
    <RadioGroup defaultValue="dragons" label="What favorite pet wouldn't be a five headed dragon" name="favorite-pet-group">
      <Radio value="dogs">Dogs</Radio>
      <Radio value="cats">Cats</Radio>
      <Radio value="dragons">Dragons</Radio>
      <Radio value="dragons">Ringu the five headed metallic dragon of gold, silver, bronze, copper, and brass</Radio>
    </RadioGroup>
    <SearchField label="Search for the entirety of knowledge on Creative Cloud Express" placeholder="Enter text" />
    <TextArea label="Please write an epic story of fact and fantasy in the epic sci-fi genre of dinosaurs" placeholder="How do you feel?" />
    <TextField label="Cities of past, present, and future" placeholder="San Francisco" />
  </Form>
);

export const Default = {
  render: Template,
  name: 'default',
  args: {}
};

export const DefaultNarrow = {
  render: Template,
  name: 'default, width: 200px',
  args: {width: '200px'}
};

export const LabelPositionSide = {
  render: Template,
  name: 'label position: side',
  args: {...Default.args, labelPosition: 'side'}
};

export const LabelAlignEnd = {
  render: Template,
  name: 'label align: end',
  args: {...Default.args, labelAlign: 'end'}
};

export const NecessityIndicatorLabel = {
  render: Template,
  name: 'necessity indicator: label',
  args: {...Default.args, necessityIndicator: 'label'}
};

export const LabelPositionSideRequiredNecessityIndicatorLabel = {
  render: Template,
  name: 'label position: side, isRequired, necessity indicator: label',
  args: {...Default.args, labelPosition: 'side', necessityIndicator: 'label', isRequired: true}
};

export const LabelPositionSideRequiredNecessityIndicatorLabelNarrow = {
  render: Template,
  name: 'label position: side, isRequired, necessity indicator: label, width: 200px',
  args: {
    ...Default.args,
    labelPosition: 'side',
    necessityIndicator: 'label',
    isRequired: true,
    width: '200px'
  }
};

export const Quiet = {
  render: Template,
  name: 'isQuiet',
  args: {...Default.args, isQuiet: true}
};

export const QuietLabelPositionSideAlignEnd = {
  render: Template,
  name: 'isQuiet, label position: side, label align: end',
  args: {...Default.args, isQuiet: true, labelPosition: 'side', labelAlign: 'end'}
};

export const QuietLabelPositionSideNarrow = {
  render: Template,
  name: 'isQuiet, label position: side, width: 200px',
  args: {...Default.args, isQuiet: true, labelPosition: 'side', width: '200px'}
};
