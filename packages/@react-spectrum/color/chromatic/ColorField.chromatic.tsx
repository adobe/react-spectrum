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

import {ColorField} from '../';
import {generatePowerset} from '@react-spectrum/story-utils';
import {Grid, repeat} from '@react-spectrum/layout';
import {Meta, Story} from '@storybook/react';
import React from 'react';
import {SpectrumColorFieldProps} from '@react-types/color';

// Ignore read only because it doesn't apply any distingishable visual features
let states = [
  {isQuiet: true},
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

const meta: Meta = {
  title: 'ColorField'
};

export default meta;

const Template: Story<SpectrumColorFieldProps> = (args) => (
  <Grid columns={repeat(3, '1fr')} autoFlow="row" gap="size-200">
    {combinations.map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }
      return <ColorField key={key} {...args} {...c} label={key} />;
    })}
  </Grid>
);

const TemplateSmall: Story<SpectrumColorFieldProps> = (args) => (
  <Grid columns={repeat(2, '1fr')} autoFlow="row" gap="size-200">
    {combinations.map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }
      return <ColorField key={key} {...args} {...c} label={key} />;
    })}
  </Grid>
);

const NoLabelTemplate: Story<SpectrumColorFieldProps> = (args) => (
  <Grid columns={repeat(3, '1fr')} autoFlow="row" gap="size-300">
    {combinations.filter(combo => combo.isRequired == null && combo.necessityIndicator == null).map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }
      return <ColorField key={key} {...args} {...c} label={undefined} />;
    })}
  </Grid>
);

export const PropDefaults = Template.bind({});
PropDefaults.storyName = 'default';
PropDefaults.args = {};

export const PropDefaultValue = Template.bind({});
PropDefaultValue.storyName = 'default value';
PropDefaultValue.args = {...PropDefaults.args, defaultValue: '#abcdef'};

export const PropPlaceholder = Template.bind({});
PropPlaceholder.storyName = 'placeholder';
PropPlaceholder.args = {...PropDefaults.args, placeholder: 'Enter a hex color'};

export const PropAriaLabelled = NoLabelTemplate.bind({});
PropAriaLabelled.storyName = 'aria-label';
PropAriaLabelled.args = {'aria-label': 'Label'};

export const PropLabelEnd = Template.bind({});
PropLabelEnd.storyName = 'label end';
PropLabelEnd.args = {...PropDefaults.args, labelAlign: 'end', defaultValue: '#abcdef'};

export const PropLabelSide = TemplateSmall.bind({});
PropLabelSide.storyName = 'label side';
PropLabelSide.args = {...PropDefaults.args, labelPosition: 'side', defaultValue: '#abcdef'};

export const PropCustomWidth = Template.bind({});
PropCustomWidth.storyName = 'custom width';
PropCustomWidth.args = {...PropDefaults.args, width: 'size-3000'};
