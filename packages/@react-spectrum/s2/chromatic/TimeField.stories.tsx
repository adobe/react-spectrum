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
import {Time} from '@internationalized/date';
import {TimeField} from '../src/TimeField';
import {userEvent} from 'storybook/test';

const meta: Meta<typeof TimeField> = {
  component: TimeField,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/TimeField'
};

export default meta;

type Story = StoryObj<typeof TimeField>;

export const Default: Story = {
  args: {
    label: 'Water plants reminder'
  }
};

export const WithValue: Story = {
  args: {
    label: 'Water plants reminder',
    value: new Time(2, 15, 56),
    granularity: 'second'
  }
};

export const Focused: Story = {
  args: {
    label: 'Water plants reminder',
    value: new Time(18, 13)
  },
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
  },
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      backgrounds: ['base'],
      locales: ['en-US'],
      disableAnimations: true
    }
  }
};

const time = new Time(14, 30);

export const StaticStates: Story = {
  render: () => (
    <StaticMatrix minColumnWidth={300}>
      {(['S', 'M', 'L', 'XL'] as const).flatMap((size, index) => [
        <StaticMatrixCell key={`${size}-empty`} label={`${size} empty`}>
          <TimeField size={size} label="Reminder time" labelPosition={index % 2 ? 'side' : 'top'} />
        </StaticMatrixCell>,
        <StaticMatrixCell key={`${size}-value`} label={`${size} populated`}>
          <TimeField
            size={size}
            label="Reminder time"
            defaultValue={time}
            isDisabled={index === 0}
            isReadOnly={index === 1}
          />
        </StaticMatrixCell>
      ])}
      <StaticMatrixCell label="required invalid">
        <TimeField
          label="Reminder time"
          isRequired
          isInvalid
          description="Use local time"
          errorMessage="Enter a valid time"
          labelPosition="side"
          labelAlign="end"
        />
      </StaticMatrixCell>
    </StaticMatrix>
  )
};
