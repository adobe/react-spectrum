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
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {generatePowerset} from '@react-spectrum/story-utils';
import {Grid, repeat} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import {Meta, StoryObj} from '@storybook/react';
import React, {JSX} from 'react';
import {SpectrumColorSliderProps} from '@react-types/color';

let states = [
  {isDisabled: true},
  {label: [null, 'custom label']},
  {showValueLabel: false},
  {contextualHelp: (
    <ContextualHelp>
      <Heading>What is a segment?</Heading>
      <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
    </ContextualHelp>
  )}
];

let combinations = generatePowerset(states, (merged) => merged.label === null && (merged.showValueLabel === false || merged.contextualHelp));

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

export type ColorSliderStory = StoryObj<typeof ColorSlider>;

const Template = (args: SpectrumColorSliderProps): JSX.Element => (
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

const VerticalTemplate = (args: SpectrumColorSliderProps): JSX.Element => (
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

export const PropChannelRed: ColorSliderStory = {
  render: (args) => <Template {...args} />,
  name: 'channel: red',
  args: {channel: 'red', defaultValue: '#7f0000'}
};

export const PropChannelAlpha: ColorSliderStory = {
  render: (args) => <Template {...args} />,
  name: 'channel: alpha',
  args: {channel: 'alpha', defaultValue: '#7f0000'}
};

export const PropChannelLightness: ColorSliderStory = {
  render: (args) => <Template {...args} />,
  name: 'channel: lightness',
  args: {channel: 'lightness', defaultValue: 'hsla(0, 100%, 50%, 0.5)'}
};

export const PropChannelBrightness: ColorSliderStory = {
  render: (args) => <Template {...args} />,
  name: 'channel: brightness',
  args: {channel: 'brightness', defaultValue: 'hsba(0, 100%, 50%, 0.5)'}
};

export const PropVertical: ColorSliderStory = {
  render: (args) => <VerticalTemplate {...args} />,
  name: 'orientation: vertical',
  args: {channel: 'red', defaultValue: '#7f0000'}
};

export const PropCustomWidth: ColorSliderStory = {
  render: (args) => <Template {...args} />,
  name: 'custom width',
  args: {channel: 'red', defaultValue: '#7f0000', width: 'size-3600'}
};

export const PropCustomHeight: ColorSliderStory = {
  render: (args) => <VerticalTemplate {...args} />,
  name: 'custom height',
  args: {channel: 'red', defaultValue: '#7f0000', height: 'size-3600'}
};
