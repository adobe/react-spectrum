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

import Filter from '@spectrum-icons/workflow/Filter';
import {generatePowerset} from '@react-spectrum/story-utils';
import {Grid, repeat} from '@react-spectrum/layout';
import {Item, SearchAutocomplete} from '../';
import {Meta, StoryObj} from '@storybook/react';
import React, {JSX} from 'react';
import {SpectrumSearchAutocompleteProps} from '@react-types/autocomplete';

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

const meta: Meta<SpectrumSearchAutocompleteProps<object>> = {
  title: 'SearchAutocomplete',
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light', 'dark', 'lightest', 'darkest'],
      locales: ['en-US'],
      scales: ['medium', 'large']
    }
  },
  excludeStories: ['Template']
};

export default meta;

export type SearchAutocompleteStory = StoryObj<typeof Template>;

let items = [
  {name: 'Aardvark', id: '1'},
  {name: 'Kangaroo', id: '2'},
  {name: 'Snake', id: '3'}
];

export const Template = (args: SpectrumSearchAutocompleteProps<object>): JSX.Element => (
  <Grid columns={repeat(4, '1fr')} autoFlow="row" gap="size-200">
    {combinations.map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }

      return (
        <SearchAutocomplete key={key} {...args} {...c} label={args['aria-label'] ? undefined : key} defaultItems={items}>
          {(item: any) => <Item>{item.name}</Item>}
        </SearchAutocomplete>
      );
    })}
  </Grid>
);

// Chromatic can't handle the size of the side label story so removed some extraneous props that don't matter for side label case.
const TemplateSideLabel = (args: SpectrumSearchAutocompleteProps<object>): JSX.Element => (
  <Grid columns={repeat(2, '1fr')} autoFlow="row" gap="size-200" width={800}>
    {combinations.filter(combo => !(combo.isReadOnly || combo.isDisabled)).map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }

      return (
        <SearchAutocomplete key={key} {...args} {...c} label={key} defaultItems={items}>
          {(item: any) => <Item>{item.name}</Item>}
        </SearchAutocomplete>
      );
    })}
  </Grid>
);

export const PropDefaults: SearchAutocompleteStory = {
  render: (args) => <Template {...args} />,
  name: 'default',
  args: {}
};

export const PropInputValue: SearchAutocompleteStory = {
  render: (args) => <Template {...args} />,
  name: 'inputValue: Blah',
  args: {inputValue: 'Blah'}
};

export const PropAriaLabelled: SearchAutocompleteStory = {
  render: (args) => <Template {...args} />,
  name: 'aria-label',
  args: {'aria-label': 'Label'}
};

export const PropLabelEnd: SearchAutocompleteStory = {
  render: (args) => <Template {...args} />,
  name: 'label end',
  args: {...PropDefaults.args, labelAlign: 'end'}
};

export const PropLabelSide: SearchAutocompleteStory = {
  render: (args) => <TemplateSideLabel {...args} />,
  name: 'label side',
  args: {...PropDefaults.args, labelPosition: 'side'}
};

export const PropCustomWidth: SearchAutocompleteStory = {
  render: (args) => <Template {...args} />,
  name: 'custom width',
  args: {...PropDefaults.args, width: 'size-1600'},

  parameters: {
    chromaticProvider: {
      express: false
    }
  }
};

export const PropIconFilter: SearchAutocompleteStory = {
  render: (args) => <Template {...args} />,
  name: 'icon: Filter',
  args: {...PropDefaults.args, icon: <Filter />}
};

export const PropIconNull: SearchAutocompleteStory = {
  render: (args) => <Template {...args} />,
  name: 'icon: null',
  args: {...PropDefaults.args, icon: null}
};
