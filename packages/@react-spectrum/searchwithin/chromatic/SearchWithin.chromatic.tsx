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

import {generatePowerset} from '@react-spectrum/story-utils';
import {Grid, repeat} from '@react-spectrum/layout';
import {Item, Picker} from '@react-spectrum/picker';
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import {SearchWithin} from '../';
import {SpectrumSearchWithinProps} from '@react-types/searchwithin';

let states = [
  {isRequired: true},
  {isDisabled: true},
  {necessityIndicator: 'label'}
];

let items = [
  {name: 'All', id: 'all'},
  {name: 'Campaigns', id: 'campaigns'},
  {name: 'Tags', id: 'tags'},
  {name: 'Audiences', id: 'audiences'}
];

let combinations = generatePowerset(states);

function shortName(key) {
  let returnVal = '';
  switch (key) {
    case 'isRequired':
      returnVal = 'req';
      break;
    case 'isDisabled':
      returnVal = 'disable';
      break;
    case 'necessityIndicator':
      returnVal = 'necInd=label';
      break;
  }
  return returnVal;
}

const meta: Meta<SpectrumSearchWithinProps> = {
  title: 'SearchWithin',
  parameters: {
    chromaticProvider: {colorSchemes: ['light', 'dark', 'lightest', 'darkest'], locales: ['en-US', 'ar-AE'], scales: ['medium', 'large']}
  }
};

export default meta;

const Template: StoryFn<SpectrumSearchWithinProps> = (args) => (
  <Grid columns={repeat(4, '1fr')} autoFlow="row" gap="size-200">
    {combinations.map(c => {
      let key = Object.keys(c).map(k => shortName(k)).join(' ');
      if (!key) {
        key = 'empty';
      }

      return (
        <SearchWithin key={key} {...args} {...c} label={args['aria-label'] ? undefined : key}>
          <SearchField placeholder="Search" />
          <Picker defaultSelectedKey="all">
            {items.map((item) => <Item key={item.id}>{item.name}</Item>)}
          </Picker>
        </SearchWithin>
      );
    })}
  </Grid>
);

// Chromatic can't handle the size of the side label story so removed some extraneous props that don't matter for side label case.
const TemplateSideLabel: StoryFn<SpectrumSearchWithinProps> = (args) => (
  <Grid columns={repeat(2, '1fr')} autoFlow="row" gap="size-200">
    {combinations.map(c => {
      let key = Object.keys(c).map(k => shortName(k)).join(' ');
      if (!key) {
        key = 'empty';
      }

      return (
        <SearchWithin key={key} {...args} {...c} label={args['aria-label'] ? undefined : key}>
          <SearchField placeholder="Search" />
          <Picker defaultSelectedKey="all">
            {items.map((item) => <Item key={item.id}>{item.name}</Item>)}
          </Picker>
        </SearchWithin>
      );
    })}
  </Grid>
);

export const PropDefaults = {
  render: Template,
  name: 'default',
  args: {}
};

export const PropLabelSide = {
  render: TemplateSideLabel,
  name: 'label side',
  args: {...PropDefaults.args, labelPosition: 'side'}
};

export const PropNoLabel = {
  render: TemplateSideLabel,
  name: 'no label',
  args: {...PropDefaults.args, label: undefined, 'aria-label': 'Aria Label'}
};

export const PropCustomWidth = {
  render: Template,
  name: 'custom width',
  args: {...PropDefaults.args, width: 300}
};
