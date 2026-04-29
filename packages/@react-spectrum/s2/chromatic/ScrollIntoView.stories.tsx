/*
 * Copyright 2026 Adobe. All rights reserved.
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
import {ScrollIntoViewExample} from '../../../react-aria-components/stories/ScrollIntoView.stories';
import {userEvent, within} from 'storybook/test';

const meta: Meta<typeof ScrollIntoViewExample> = {
  component: ScrollIntoViewExample,
  parameters: {
    layout: 'fullscreen',
    chromaticProvider: {colorSchemes: ['light'], backgrounds: ['base'], locales: ['en-US'], disableAnimations: true}
  },
  title: 'S2 Chromatic/ScrollIntoView'
};

export default meta;

type Story = StoryObj<typeof ScrollIntoViewExample>;

export const YellowStart: Story = {
  render: () => <ScrollIntoViewExample />,
  play: async ({canvasElement}) => {
    let button = await within(canvasElement).findByRole('button', {name: 'Scroll to Yellow (Start)'});
    await userEvent.click(button);
  }
};

export const YellowEnd: Story = {
  render: () => <ScrollIntoViewExample />,
  play: async ({canvasElement}) => {
    let button = await within(canvasElement).findByRole('button', {name: 'Scroll to Yellow (End)'});
    await userEvent.click(button);
  }
};
