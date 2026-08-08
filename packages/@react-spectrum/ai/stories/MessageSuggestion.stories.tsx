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

import {categorizeArgTypes, getActionArgs} from '../../s2/stories/utils';
import {MessageSuggestion, MessageSuggestionList} from '@react-spectrum/ai';
import type {Meta, StoryObj} from '@storybook/react';

const events = ['onPress'];

const meta: Meta<typeof MessageSuggestionList> = {
  component: MessageSuggestionList,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', events)
  },
  args: {
    ...getActionArgs(events)
  },
  title: 'AI/MessageSuggestionList'
};

export default meta;
type Story = StoryObj<typeof MessageSuggestionList>;

export const Example: Story = {
  args: {
    title: 'What would you like to do next?'
  },
  render: args => (
    <MessageSuggestionList {...args}>
      <MessageSuggestion>
        Create a year-over-year growth chart for the next decade
      </MessageSuggestion>
      <MessageSuggestion>Generate a congratulatory poster</MessageSuggestion>
      <MessageSuggestion>Summarize development pipeline</MessageSuggestion>
    </MessageSuggestionList>
  ),
  decorators: [
    Story => (
      <div style={{minWidth: '100px', padding: '10px', resize: 'horizontal', overflow: 'auto'}}>
        <Story />
      </div>
    )
  ]
};
