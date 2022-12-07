/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import _123 from '@spectrum-icons/workflow/123';
import {Alert} from '../';
import CalendarCheckColor from '@spectrum-icons/color/CalendarCheckColor';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import React from 'react';

export default {
  title: 'Alert',
  component: Alert,
  args: {
    'title': 'Title',
    variant: 'info'
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'help', 'success', 'error', 'warning']
    },
    title: {
      control: 'text'
    },
    'aria-live': {
      control: 'select',
      options: ['polite', 'off']
    }
  }
} as ComponentMeta<typeof Alert>;

export type ActionGroupStory = ComponentStoryObj<typeof Alert>;

export const Default: ActionGroupStory = {
  render: (args) => render(args)
};

function render(props) {
  return (
    <Alert
      {...props}>
      This is a React Spectrum alert
      <_123 />
      <CalendarCheckColor />
    </Alert>
  );
}
