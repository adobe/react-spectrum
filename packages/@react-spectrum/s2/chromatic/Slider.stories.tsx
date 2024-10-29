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

import {Content, Footer, Heading, Text} from '../src/Content';
import {ContextualHelp} from '../src/ContextualHelp';
import {Link} from '../src/Link';
import type {Meta} from '@storybook/react';
import {Slider} from '../src/Slider';
import {style} from '../style/spectrum-theme' with { type: 'macro' };

const meta: Meta<typeof Slider> = {
  component: Slider,
  parameters: {
    chromaticProvider: {disableAnimations: true},
    controls: {exclude: ['onChange']} // purposely excluded this control because it was slowing slider down a lot
  },
  title: 'S2 Chromatic/Slider'
};

export default meta;

export const Example = (args: any) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
    <Slider {...args} />
  </div>
);

Example.args = {
  label: 'Cookies',
  defaultValue: 30
};

export const FillOffset = (args: any) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
    <Slider {...args} />
  </div>
);

FillOffset.args = {
  label: 'Exposure',
  fillOffset: 0,
  defaultValue: 1.83,
  minValue: -5,
  maxValue: 5,
  formatOptions: {signDisplay: 'always'},
  step: 0.01
};

export const FormatOptions = (args: any) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
    <Slider {...args} styles={style({width: '[300px]'})} />
  </div>
);

FormatOptions.args = {
  label: 'Currency',
  defaultValue: 0,
  maxValue: 500,
  formatOptions: {style: 'currency', currency: 'JPY'}
};

export const MinMaxValue = (args: any) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
    <Slider {...args} />
  </div>
);

MinMaxValue.args = {
  label: 'Size',
  minValue: 1,
  maxValue: 5
};

export const ContextualHelpExample = (args: any) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
    <Slider {...args} />
  </div>
);

ContextualHelpExample.args = {
  label: 'Cookies',
  defaultValue: 30,
  contextualHelp: (
    <ContextualHelp>
      <Heading>What is a ice cream?</Heading>
      <Content>
        <Text>
          A combination of sugar, eggs, milk, and cream is cooked to make
          a custard base. Then, flavorings are added, and this flavored
          mixture is carefully churned and frozen to make ice cream.
        </Text>
      </Content>
      <Footer>
        <Link
          isStandalone
          href="https://en.wikipedia.org/wiki/Ice_cream"
          target="_blank">Learn more about ice cream</Link>
      </Footer>
    </ContextualHelp>
  )
};

