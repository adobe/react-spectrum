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

import {Button} from '../src/Button';
import {Form} from '../src/Form';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};
import {TagField, TagFieldValue} from '../src/TagField';

const meta: Meta<typeof TagField> = {
  component: TagField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: {table: {category: 'Events'}},
    label: {control: {type: 'text'}},
    description: {control: {type: 'text'}},
    errorMessage: {control: {type: 'text'}},
    contextualHelp: {table: {disable: true}}
  },
  args: {
    label: 'Categories',
    placeholder: 'Add a tag…',
    styles: style({width: 288})
  },
  title: 'TagField'
};

export default meta;

type Story = StoryObj<typeof TagField>;

const tags = new TagFieldValue([
  {type: 'token', text: 'Architecture'},
  {type: 'token', text: 'Design'},
  {type: 'token', text: 'Development'},
  {type: 'token', text: 'Marketing'},
  {type: 'token', text: 'Sales'}
]);

export const Example: Story = {
  args: {
    defaultValue: tags
  }
};

export const Empty: Story = {};

export const MaxHeight: Story = {
  args: {
    defaultValue: new TagFieldValue([
      {type: 'token', text: 'Architecture'},
      {type: 'token', text: 'Design'},
      {type: 'token', text: 'Development'},
      {type: 'token', text: 'Marketing'},
      {type: 'token', text: 'Sales'},
      {type: 'token', text: 'Engineering'},
      {type: 'token', text: 'Research'},
      {type: 'token', text: 'Operations'},
      {type: 'token', text: 'Finance'},
      {type: 'token', text: 'Legal'},
      {type: 'token', text: 'Support'},
      {type: 'token', text: 'Product'}
    ]),
    styles: style({width: 288, maxHeight: 112})
  }
};

export const Validation: Story = {
  render: args => (
    <Form>
      <TagField {...args} />
      <Button type="submit" variant="primary">
        Submit
      </Button>
    </Form>
  ),
  args: {
    isRequired: true
  }
};

export const Disabled: Story = {
  args: {
    defaultValue: tags,
    isDisabled: true
  }
};
