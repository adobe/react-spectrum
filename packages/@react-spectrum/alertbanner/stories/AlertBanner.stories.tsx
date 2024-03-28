/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import {AlertBanner, SpectrumAlertBannerProps} from '../';
import {Meta} from '@storybook/react';
import React from 'react';

// see https://github.com/storybookjs/storybook/issues/8426#issuecomment-669021940
const StoryFn = ({storyFn}) => storyFn();

const meta: Meta<SpectrumAlertBannerProps> = {
  title: 'AlertBanner',
  component: AlertBanner,
  decorators: [storyFn => <StoryFn storyFn={storyFn} />],
  parameters: {
    layout: 'fullscreen'
  }
};

export default meta;

export const Neutral = {
  render: args => (
    <AlertBanner 
      text="This is a neutral alert banner"
      actionLabel="Learn more"
      isDismissable
      onAction={action('onAction')}
      {...args} />
    )
};

export const Negative = {
  render: args => (
    <AlertBanner 
      text="This is a negative alert banner"
      variant="negative"
      actionLabel="Learn more"
      isDismissable
      onAction={action('onAction')}
      {...args} />
    )
};

export const Info = {
  render: args => (
    <AlertBanner 
      text="This is an info alert banner"
      variant="info"
      actionLabel="Learn more"
      isDismissable
      onAction={action('onAction')}
      {...args} />
    )
};

export const LargeContent = {
  name: 'Large content with action button',
  render: args => (
    <AlertBanner 
      text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc nec convallis ex, sed blandit urna. Suspendisse sagittis nisl at turpis ullamcorper, quis tincidunt diam pellentesque. Nunc risus neque, sagittis at nibh feugiat, placerat facilisis urna. Suspendisse luctus a nisl non mollis."
      variant="info"
      actionLabel="Learn more"
      isDismissable
      onAction={action('onAction')}
      {...args} />
    )
};
