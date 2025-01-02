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

import {Example, LongLabel} from '../stories/Tooltip.stories';
import type {Meta, StoryObj} from '@storybook/react';
import {Tooltip} from '../src';
import {userEvent, within} from '@storybook/testing-library';

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], backgrounds: ['base'], locales: ['en-US'], disableAnimations: true}
  },
  tags: ['autodocs'],
  title: 'S2 Chromatic/Tooltip'
};

export default meta;

export const Default = {
  ...Example,
  play: async ({canvasElement}) => {
    await userEvent.tab();
    let body = canvasElement.ownerDocument.body;
    await within(body).findByRole('tooltip');
  }
} as StoryObj;

export const WithLongLabel = {
  ...LongLabel,
  play: async (context) => await Default.play!(context)
} as StoryObj;
