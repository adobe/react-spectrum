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

import {Badge, Text} from '../src';
import CheckmarkCircle from '../s2wf-icons/S2_Icon_CheckmarkCircle_20_N.svg';
import type {Meta} from '@storybook/react';
import {style} from '../style' with { type: 'macro' };

const meta: Meta<typeof Badge> = {
  component: Badge,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'Badge'
};

export default meta;

export const Example = (args: any) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
    <Badge {...args}>
      Licensed
    </Badge>
    <Badge {...args}>
      <CheckmarkCircle aria-label="done" />
      <Text>Licensed</Text>
    </Badge>
    <Badge {...args}>
      <CheckmarkCircle aria-label="done" />
    </Badge>
    <Badge {...args} styles={style({maxWidth: 128})}>
      <CheckmarkCircle aria-label="done" />
      <Text>Very long badge with wrapping text to see what happens</Text>
    </Badge>
  </div>
);
