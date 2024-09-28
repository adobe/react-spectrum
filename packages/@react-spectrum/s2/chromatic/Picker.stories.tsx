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

import {ContextualHelpExample, CustomWidth, Dynamic, Example, Sections, WithIcons} from '../stories/Picker.stories';
import type {Meta, StoryObj} from '@storybook/react';
import {Picker} from '../src';
import {userEvent, within} from '@storybook/testing-library';

const meta: Meta<typeof Picker<any>> = {
  component: Picker,
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], backgrounds: ['base'], locales: ['en-US'], disableAnimations: true}
  },
  tags: ['autodocs'],
  title: 'S2 Chromatic/Picker'
};

export default meta;

export const Default = Example as StoryObj;

Default.play = async ({canvasElement}) => {
  await userEvent.tab();
  await userEvent.keyboard('{ArrowDown}');
  let body = canvasElement.ownerDocument.body;
  await within(body).findByRole('listbox');
};

export const WithSections = {...Sections};

WithSections.play = async (context) => {
  await Default.play!(context);
};

export const DynamicExample = {...Dynamic, name: 'Dynamic'} as StoryObj;

DynamicExample.play = async (context) => {
  await Default.play!(context);
};

export const Icons = {...WithIcons, name: 'With Icons'} as StoryObj;

Icons.play = async (context) => {
  await Default.play!(context);
};

export const WithCustomWidth = CustomWidth as StoryObj;

WithCustomWidth.play = async (context) => {
  await Default.play!(context);
};

export const ContextualHelp = {...ContextualHelpExample} as StoryObj;

ContextualHelp.play = async ({canvasElement}) => {
  await userEvent.tab();
  await userEvent.keyboard('{Enter}');
  let body = canvasElement.ownerDocument.body;
  await within(body).findByRole('dialog');
};
