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

import {ActionMenu} from '../src';
import {DynamicExample, Example} from '../stories/ActionMenu.stories';
import type {Meta, StoryObj} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';

const meta: Meta<typeof ActionMenu> = {
  component: ActionMenu,
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], backgrounds: ['base'], locales: ['en-US'], disableAnimations: true}
  },
  title: 'S2 Chromatic/ActionMenu'
};

export default meta;
type Story = StoryObj<typeof ActionMenu<any>>;

export const Static: Story = {...Example};

Static.play = async ({canvasElement}) => {
  await userEvent.tab();
  await userEvent.keyboard('[Enter]');
  let body = canvasElement.ownerDocument.body;
  await within(body).findByRole('menu');
};

export const Dynamic = {...DynamicExample};

Dynamic.play = async ({canvasElement}) => {
  await userEvent.tab();
  await userEvent.keyboard('[Enter]');
  let body = canvasElement.ownerDocument.body;
  await within(body).findByRole('menu');
};
