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

import type {Meta, StoryObj} from '@storybook/react';
import {StaticMatrix, StaticMatrixCell} from './utils';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {Switch} from '../src/Switch';

const meta: Meta<typeof Switch> = {
  component: Switch,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  argTypes: {
    inputRef: {control: {disable: true}},
    onChange: {table: {category: 'Events'}}
  },
  title: 'S2 Chromatic/Switch'
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Example: Story = {
  render: args => <Switch {...args}>Wi-Fi</Switch>
};

export const LongLabel: Story = {
  render: args => (
    <Switch {...args} styles={style({maxWidth: 128})}>
      Switch with very long label so we can see wrapping
    </Switch>
  )
};

const sizes = ['S', 'M', 'L', 'XL'] as const;

export const StaticStates: Story = {
  render: () => (
    <StaticMatrix>
      {sizes.flatMap(size => [
        <StaticMatrixCell key={`${size}-default`} label={`${size} unselected`}>
          <Switch size={size}>Wi-Fi</Switch>
        </StaticMatrixCell>,
        <StaticMatrixCell key={`${size}-selected`} label={`${size} selected emphasized`}>
          <Switch size={size} defaultSelected isEmphasized>
            Wi-Fi
          </Switch>
        </StaticMatrixCell>,
        <StaticMatrixCell key={`${size}-disabled`} label={`${size} disabled`}>
          <Switch size={size} isDisabled>
            Wi-Fi
          </Switch>
        </StaticMatrixCell>,
        <StaticMatrixCell key={`${size}-selected-disabled`} label={`${size} selected disabled`}>
          <Switch size={size} defaultSelected isDisabled>
            Wi-Fi
          </Switch>
        </StaticMatrixCell>
      ])}
      <StaticMatrixCell label="description">
        <Switch description="Controls wireless connectivity">Wi-Fi</Switch>
      </StaticMatrixCell>
      <StaticMatrixCell label="invalid with error">
        <Switch isInvalid errorMessage="A connection option is required">
          Wi-Fi
        </Switch>
      </StaticMatrixCell>
    </StaticMatrix>
  )
};
