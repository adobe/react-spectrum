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
import {Meter} from '../src/Meter';
import {StaticColorDecorator} from '../stories/utils';
import {StaticColorProvider} from '../stories/utils';
import {StaticMatrix, StaticMatrixCell} from './utils';

const meta: Meta<typeof Meter> = {
  component: Meter,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  decorators: [StaticColorDecorator],
  title: 'S2 Chromatic/Meter'
};

export default meta;
type Story = StoryObj<typeof Meter>;

export const Example: Story = {
  render: args => <Meter {...args} />,
  args: {
    label: 'Storage space',
    value: 80,
    variant: 'informative'
  }
};

const meterVariants = ['informative', 'positive', 'notice', 'negative'] as const;
const meterSizes = ['S', 'M', 'L', 'XL'] as const;

export const StaticOptions: Story = {
  render: () => (
    <StaticMatrix minColumnWidth={260}>
      {meterVariants.flatMap(variant =>
        meterSizes.map((size, index) => (
          <StaticMatrixCell key={`${variant}-${size}`} label={`${variant} ${size}`}>
            <Meter
              label="Storage space"
              labelPosition={index % 2 ? 'side' : 'top'}
              size={size}
              value={index % 2 ? 100 : 0}
              variant={variant}
            />
          </StaticMatrixCell>
        ))
      )}
      {(['black', 'white', 'auto'] as const).map(staticColor => (
        <StaticMatrixCell key={staticColor} label={`static ${staticColor}`}>
          <StaticColorProvider staticColor={staticColor} hideColorPicker>
            <Meter label="Storage space" staticColor={staticColor} value={65} />
          </StaticColorProvider>
        </StaticMatrixCell>
      ))}
    </StaticMatrix>
  )
};
