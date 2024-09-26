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

import type {Meta} from '@storybook/react';
import {ProgressBar} from '../src';
import {StaticColorDecorator} from '../stories/utils';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof ProgressBar> = {
  component: ProgressBar,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  decorators: [StaticColorDecorator],
  title: 'S2 Chromatic/ProgressBar'
};

export default meta;

export const Example = {
  args: {
    label: 'Loading…',
    value: 80
  }
};

export const LabelPositionSide = {
  args: {
    label: 'Loading…',
    value: 80,
    labelPosition: 'side'
  }
};

export const Size = {
  render: (args) => (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 24})}>
      <ProgressBar label="S" size="S" {...args} />
      <ProgressBar label="M" size="M" {...args} />
      <ProgressBar label="L" size="L" {...args} />
      <ProgressBar label="XL" size="XL" {...args} />
    </div>
  ),
  args: {
    value: 80
  }
};

export const StaticColorWhite = {
  args: {
    label: 'Loading',
    value: 80,
    staticColor: 'white'
  }
};

export const StaticColorBlack = {
  args: {
    label: 'Loading',
    value: 80,
    staticColor: 'black'
  }
};

export const Value0 = {
  args: {
    label: 'Loading',
    value: 0
  }
};

export const Value100 = {
  args: {
    label: 'Loading',
    value: 100
  }
};
