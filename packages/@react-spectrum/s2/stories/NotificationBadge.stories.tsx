/*
 * Copyright 2025 Adobe. All rights reserved.
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
import {NotificationBadge} from '../src';

const meta: Meta<typeof NotificationBadge> = {
  component: NotificationBadge,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'NotificationBadge'
};

export default meta;

export const Example = (args: any) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: '600px'}}>
    {Array.from({length: 100}, (_, i) => i + 1).map(value => (
      <NotificationBadge key={value} {...args} value={value} />
    ))}
  </div>
);

export const Empty = (args: any) => (
  <NotificationBadge {...args} />
);
