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

import {Button} from '../src/Button';
import {Form} from '../src/Form';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};
import {Switch} from '../src/Switch';

const meta: Meta<typeof Switch> = {
  component: Switch,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    inputRef: {control: {disable: true}},
    onChange: {table: {category: 'Events'}}
  },
  title: 'Switch'
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Example: Story = {
  render: args => <Switch {...args}>Wi-Fi</Switch>
};

export const LongLabel: Story = {
  render: args => (
    <Switch {...args} styles={style({maxWidth: 128})}>
      Switch with very long label so we can see wrapping
    </Switch>
  )
};

export const HelpText: Story = {
  render: args => (
    <Switch {...args} styles={style({width: 300})}>
      Product updates
    </Switch>
  ),
  args: {
    description: 'Your organization requires two-factor authentication.',
    errorMessage: 'You must enable two-factor authentication.'
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const Test: Story = {
  render: () => (
    <div style={{overflow: 'scroll', width: '100vw', height: '100vh'}}>
      <div style={{border: '1px solid black', width: '100%', height: '1200px'}}>abcd</div>
      <Form>
        <Switch
          name="two-factor"
          isRequired
          description="Your organization requires two-factor authentication.">
          Two-factor authentication
        </Switch>
        <Button type="submit">Submit</Button>
      </Form>
    </div>
  )
};
