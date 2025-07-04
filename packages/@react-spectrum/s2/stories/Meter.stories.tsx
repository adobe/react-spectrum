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
import {Meter} from '../src/Meter';
import {StaticColorDecorator} from './utils';

const meta: Meta<typeof Meter> = {
  component: Meter,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    label: {control: {type: 'text'}}
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs'],
  title: 'Meter'
};

export default meta;

export const Example = (args: any) => <Meter {...args} />;

Example.args = {
  label: 'Storage space',
  value: 80,
  variant: 'informative'
};
