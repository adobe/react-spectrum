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
import {Breadcrumbs, Breadcrumb, Heading} from '../src';
import {action} from '@storybook/addon-actions';

const meta: Meta<typeof Breadcrumbs> = {
  component: Breadcrumbs,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    size: {
      control: 'radio',
      options: ['M', 'L']
    },
    isDisabled: {
      control: {type: 'boolean'}
    },
    isMultiline: {
      control: {type: 'boolean'}
    },
    onAction: {
      table: {category: 'Events'}
    }
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <Breadcrumbs {...args}>
    <Breadcrumb href="/">
      Home
    </Breadcrumb>
    <Breadcrumb href="/react-aria">
      React Aria
    </Breadcrumb>
    <Breadcrumb href="/breadcrumbs">
      Breadcrumbs
    </Breadcrumb>
  </Breadcrumbs>
);

export const WithActions = (args: any) => (
  <Breadcrumbs onAction={action('onAction')} {...args}>
    <Breadcrumb>
      Home
    </Breadcrumb>
    <Breadcrumb>
      React Aria
    </Breadcrumb>
    <Breadcrumb>
      Breadcrumbs
    </Breadcrumb>
  </Breadcrumbs>
);

export const WithUserProvidedHeading = (args: any) => (
  <Breadcrumbs isMultiline {...args}>
    <Breadcrumb href="/">
      Home
    </Breadcrumb>
    <Breadcrumb href="/react-aria">
      React Aria
    </Breadcrumb>
    <Breadcrumb href="/breadcrumbs">
      <Heading level={2}>
        Breadcrumbs
      </Heading>
    </Breadcrumb>
  </Breadcrumbs>
);
