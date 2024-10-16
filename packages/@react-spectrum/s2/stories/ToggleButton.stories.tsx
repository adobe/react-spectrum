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

import {categorizeArgTypes, StaticColorDecorator} from './utils';
import type {Meta, StoryFn} from '@storybook/react';
import NewIcon from '../s2wf-icons/S2_Icon_New_20_N.svg';
import {Text, ToggleButton} from '../src';

const meta: Meta<typeof ToggleButton> = {
  component: ToggleButton,
  parameters: {
    layout: 'centered'
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', ['onPress', 'onPressChange', 'onPressEnd', 'onPressStart', 'onPressUp', 'onChange'])
  },
  title: 'ToggleButton'
};

export default meta;

export const Example: StoryFn<typeof ToggleButton> = (args) => {
  return (
    <div style={{display: 'flex', gap: 8}}>
      <ToggleButton aria-label="Press me" {...args}><NewIcon /></ToggleButton>
      <ToggleButton {...args}>Press me</ToggleButton>
      <ToggleButton {...args}><NewIcon /><Text>Press me</Text></ToggleButton>
    </div>
  );
};
