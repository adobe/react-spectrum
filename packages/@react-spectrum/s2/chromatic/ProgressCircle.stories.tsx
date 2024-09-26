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
import {ProgressCircle} from '../src';
import {StaticColorDecorator} from '../stories/utils';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof ProgressCircle> = {
  component: ProgressCircle,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  decorators: [StaticColorDecorator],
  title: 'S2 Chromatic/ProgressCircle'
};

export default meta;
type Story = StoryObj<typeof ProgressCircle>;

export const Example: Story = {
  render: (args) => (
    <div className={style({display: 'flex', alignItems: 'center', gap: 24})} >
      <ProgressCircle aria-label="Test Progress Circle S" size="S" {...args} />
      <ProgressCircle aria-label="Test Progress Circle M" size="M" {...args} />
      <ProgressCircle aria-label="Test Progress Circle L" size="L" {...args} />
    </div>
  ),
  args: {
    value: 80
  }
};

export const StaticColorWhite: Story = {
  render: (args) => <ProgressCircle aria-label="Test Progress Circle" {...args} />,
  args: {
    staticColor: 'white',
    value: 80
  }
};

export const StaticColorBlack: Story = {
  render: (args) => <ProgressCircle aria-label="Test Progress Circle" {...args} />,
  args: {
    staticColor: 'black',
    value: 80
  }
};
