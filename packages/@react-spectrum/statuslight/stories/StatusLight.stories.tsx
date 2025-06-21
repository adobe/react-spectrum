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

import {Meta, StoryObj} from '@storybook/react';
import {StatusLight} from '../';

type StatusLightStory = StoryObj<typeof StatusLight>;

export default {
  title: 'StatusLight',
  component: StatusLight,
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: ['positive', 'negative', 'notice', 'info', 'neutral', 'celery', 'chartreuse', 'yellow', 'magenta', 'fuchsia', 'purple', 'indigo', 'seafoam']
      }
    },
    isDisabled: {
      control: 'boolean'
    }
  }
} as Meta<typeof StatusLight>;

export const Default: StatusLightStory = {
  args: {children: 'Status light of love', variant: 'positive'},
  name: 'Default'
};
