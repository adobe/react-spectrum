/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ColorSlider, Content, ContextualHelp, Heading} from '../src';
import {generatePowerset} from '@react-spectrum/story-utils';
import type {Meta} from '@storybook/react';
import {shortName} from './utils';
import {style} from '../style' with { type: 'macro' };

const meta: Meta<typeof ColorSlider> = {
  component: ColorSlider,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/ColorSlider'
};

export default meta;

// TODO: show value label not yet supported in S2
let states = [
  {isDisabled: true},
  {label: [null, 'custom label']},
  {contextualHelp: (
    <ContextualHelp>
      <Heading>What is a segment?</Heading>
      <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
    </ContextualHelp>
  )}
];

let combinations = generatePowerset(states, (merged) => merged.label === null && (merged.showValueLabel === false || merged.contextualHelp));

const Template = (args) => (
  <div className={style({display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoFlow: 'row', justifyItems: 'start', gap: 24, width: '[100vw]'})}>
    {combinations.map(c => {
      let fullComboName = Object.keys(c).map(k => `${k}: ${c[k]}`).join(' ');
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }
      return <ColorSlider data-testid={fullComboName} key={key} {...args} {...c} label={c.label === 'custom label' ? key : c.label} />;
    })}
  </div>
);

const VerticalTemplate = (args) => (
  <div className={style({display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridAutoFlow: 'row', justifyItems: 'start', gap: 24, width: '[100vw]'})}>
    {combinations.map(c => {
      let fullComboName = Object.keys(c).map(k => `${k}: ${c[k]}`).join(' ');
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }
      return <ColorSlider data-testid={fullComboName} key={key} {...args} {...c} label={c.label === 'custom label' ? key : c.label} orientation="vertical" />;
    })}
  </div>
);

export const PropChannelRed = {
  render: Template,
  name: 'channel: red',
  args: {channel: 'red', defaultValue: '#7f0000'}
};

export const PropChannelAlpha = {
  render: Template,
  name: 'channel: alpha',
  args: {channel: 'alpha', defaultValue: '#7f0000'}
};

export const PropChannelLightness = {
  render: Template,
  name: 'channel: lightness',
  args: {channel: 'lightness', defaultValue: 'hsla(0, 100%, 50%, 0.5)'}
};

export const PropChannelBrightness = {
  render: Template,
  name: 'channel: brightness',
  args: {channel: 'brightness', defaultValue: 'hsba(0, 100%, 50%, 0.5)'}
};

export const PropVertical = {
  render: VerticalTemplate,
  name: 'orientation: vertical',
  args: {channel: 'red', defaultValue: '#7f0000'}
};

export const PropCustomWidth = {
  render: Template,
  name: 'custom width',
  args: {channel: 'red', defaultValue: '#7f0000', styles: style({width: 384})}
};

// TODO: Not yet supported in S2
// export const PropCustomHeight = {
//   render: VerticalTemplate,
//   name: 'custom height',
//   args: {channel: 'red', defaultValue: '#7f0000', styles: style({height: 384})}
// };
