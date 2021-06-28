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

import {ColorSlider} from '../';
import {generatePowerset} from '@react-spectrum/story-utils';
import {Grid, repeat} from '@react-spectrum/layout';
import {Meta, Story} from '@storybook/react';
import React from 'react';
import {SpectrumColorSliderProps} from '@react-types/color';

let states = [
  {isDisabled: true},
  {label: [null, 'custom label']},
  {showValueLabel: false}
];

let combinations = generatePowerset(states, (merged) => merged.label === null && merged.showValueLabel === false);

function shortName(key, value) {
  let returnVal = '';
  switch (key) {
    case 'isDisabled':
      returnVal = 'disable';
      break;
    case 'label':
      returnVal = `${value === null ? 'no label' : value}`;
      break;
    case 'orientation':
      returnVal = 'vertical';
      break;
    case 'showValueLabel':
      returnVal = 'noValLabel';
      break;
  }
  return returnVal;
}

const meta: Meta = {
  title: 'ColorSlider'
};

export default meta;

const Template: Story<SpectrumColorSliderProps> = (args) => (
  <Grid columns={repeat(states.length, '1fr')} autoFlow="row" gap="size-300">
    {combinations.map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }
      return <ColorSlider key={key} {...args} {...c} label={c.label === 'custom label' ? key : c.label} />;
    })}
  </Grid>
);

const VerticalTemplate: Story<SpectrumColorSliderProps> = (args) => (
  <Grid columns={repeat(5, '1fr')} autoFlow="row" gap="size-300">
    {combinations.map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }
      return <ColorSlider key={key} {...args} {...c} label={c.label === 'custom label' ? key : c.label} orientation="vertical" />;
    })}
  </Grid>
);

export const PropChannelRed = Template.bind({});
PropChannelRed.storyName = 'channel: red';
PropChannelRed.args = {channel: 'red', defaultValue: '#7f0000'};

export const PropChannelAlpha = Template.bind({});
PropChannelAlpha.storyName = 'channel: alpha';
PropChannelAlpha.args = {channel: 'alpha', defaultValue: '#7f0000'};

export const PropChannelLightness = Template.bind({});
PropChannelLightness.storyName = 'channel: lightness';
PropChannelLightness.args = {channel: 'lightness', defaultValue: 'hsla(0, 100%, 50%, 0.5)'};

export const PropChannelBrightness = Template.bind({});
PropChannelBrightness.storyName = 'channel: brightness';
PropChannelBrightness.args = {channel: 'brightness', defaultValue: 'hsba(0, 100%, 50%, 0.5)'};

export const PropVertical = VerticalTemplate.bind({});
PropVertical.storyName = 'orientation: vertical';
PropVertical.args = {channel: 'red', defaultValue: '#7f0000'};

export const PropCustomWidth = Template.bind({});
PropCustomWidth.storyName = 'custom width';
PropCustomWidth.args = {channel: 'red', defaultValue: '#7f0000', width: 'size-3600'};

export const PropCustomHeight = VerticalTemplate.bind({});
PropCustomHeight.storyName = 'custom height';
PropCustomHeight.args = {channel: 'red', defaultValue: '#7f0000', height: 'size-3600'};
