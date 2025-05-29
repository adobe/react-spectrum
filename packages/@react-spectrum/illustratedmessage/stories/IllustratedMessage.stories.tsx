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
import {Content} from '@react-spectrum/view';
import {Heading} from '@react-spectrum/text';
import {IllustratedMessage} from '../';
import {Meta, StoryObj} from '@storybook/react';
import NotFound from '@spectrum-icons/illustrations/NotFound';
import React from 'react';

type IllustratedMessageStory = StoryObj<typeof IllustratedMessage>;

let meta = {
  title: 'IllustratedMessage',
  component: IllustratedMessage
} as Meta<typeof IllustratedMessage>;

export default meta;

export const _NotFound: IllustratedMessageStory = {
  args: {
    children: (
      <>
        <NotFound />
        <Heading>Error 404: Page not found</Heading>
        <Content>This page isn’t available. Try checking the URL or visit a different page.</Content>
      </>
    )
  },
  name: 'Not Found'
};

export const NoHeadingOrDescription: IllustratedMessageStory = {
  args: {
    children: (<NotFound aria-label="No Results" />)
  }
};
