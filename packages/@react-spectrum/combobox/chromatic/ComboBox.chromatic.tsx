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

import {ComboBox, Item} from '../';
import {generatePowerset} from '@react-spectrum/story-utils';
import {Grid, repeat} from '@react-spectrum/layout';
import {Meta, Story} from '@storybook/react';
import React from 'react';
import {SpectrumComboBoxProps} from '@react-types/combobox';

// Skipping focus styles because don't have a way of applying it via classnames
// No controlled open state also means no menu
let states = [
  {isQuiet: true},
  {isReadOnly: true},
  {isDisabled: true},
  {validationState: ['valid', 'invalid']},
  {isRequired: true},
  {necessityIndicator: 'label'}
];

let combinations = generatePowerset(states);

function shortName(key, value) {
  let returnVal = '';
  switch (key) {
    case 'isQuiet':
      returnVal = 'quiet';
      break;
    case 'isReadOnly':
      returnVal = 'ro';
      break;
    case 'isDisabled':
      returnVal = 'disable';
      break;
    case 'validationState':
      returnVal = `vs ${value}`;
      break;
    case 'isRequired':
      returnVal = 'req';
      break;
    case 'necessityIndicator':
      returnVal = 'necInd=label';
      break;
  }
  return returnVal;
}

const meta: Meta<SpectrumComboBoxProps<object>> = {
  title: 'ComboBox',
  parameters: {
    chromaticProvider: {colorSchemes: ['light', 'dark', 'lightest', 'darkest'], locales: ['en-US'], scales: ['medium', 'large']}
  }
};

export default meta;

let items = [
  {name: 'Aardvark', id: '1'},
  {name: 'Kangaroo', id: '2'},
  {name: 'Snake', id: '3'}
];

const Template: Story<SpectrumComboBoxProps<object>> = (args) => (
  <Grid columns={repeat(4, '1fr')} autoFlow="row" gap="size-200">
    {combinations.map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }

      return (
        <ComboBox key={key} {...args} {...c} label={args['aria-label'] ? undefined : key} defaultItems={items}>
          {(item: any) => <Item>{item.name}</Item>}
        </ComboBox>
      );
    })}
  </Grid>
);

// Chromatic can't handle the size of the side label story so removed some extraneous props that don't matter for side label case.
const TemplateSideLabel: Story<SpectrumComboBoxProps<object>> = (args) => (
  <Grid columns={repeat(2, '1fr')} autoFlow="row" gap="size-200" width={800}>
    {combinations.filter(combo => !(combo.isReadOnly || combo.isDisabled)).map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }

      return (
        <ComboBox key={key} {...args} {...c} label={key} defaultItems={items}>
          {(item: any) => <Item>{item.name}</Item>}
        </ComboBox>
      );
    })}
  </Grid>
);

export const PropDefaults = Template.bind({});
PropDefaults.storyName = 'default';
PropDefaults.args = {};

export const PropSelectedKey = Template.bind({});
PropSelectedKey.storyName = 'selectedKey: 2';
PropSelectedKey.args = {selectedKey: '2'};

export const PropInputValue = Template.bind({});
PropInputValue.storyName = 'inputValue: Blah';
PropInputValue.args = {inputValue: 'Blah'};

export const PropAriaLabelled = Template.bind({});
PropAriaLabelled.storyName = 'aria-label';
PropAriaLabelled.args = {'aria-label': 'Label'};

export const PropLabelEnd = Template.bind({});
PropLabelEnd.storyName = 'label end';
PropLabelEnd.args = {...PropDefaults.args, labelAlign: 'end'};

export const PropLabelSide = TemplateSideLabel.bind({});
PropLabelSide.storyName = 'label side';
PropLabelSide.args = {...PropDefaults.args, labelPosition: 'side'};

export const PropCustomWidth = Template.bind({});
PropCustomWidth.storyName = 'custom width';
PropCustomWidth.args = {...PropDefaults.args, width: 'size-1600'};
