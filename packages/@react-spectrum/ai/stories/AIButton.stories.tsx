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

import {AIButton} from '../src/AIButton';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof AIButton> = {
  component: AIButton,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    children: {table: {disable: true}},
    brandColor: {
      control: 'color',
      table: {category: 'Theming'}
    }
  },
  args: {
    brandColor: 'rgb(236, 105, 255)'
  },
  tags: ['autodocs'],
  title: 'AI/AIButton'
};

export default meta;
type Story = StoryObj<typeof AIButton>;

export const Example: Story = {
  render: args => (
    <div style={{display: 'flex', gap: 8}}>
      <AIButton {...args}>Ask AI</AIButton>
      <AIButton {...args} aria-label="Ask AI" />
    </div>
  )
};
