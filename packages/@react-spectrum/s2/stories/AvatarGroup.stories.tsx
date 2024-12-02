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

import {Avatar, AvatarGroup, Provider} from '../src';
import type {Meta} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};

const meta: Meta<typeof AvatarGroup> = {
  component: AvatarGroup,
  argTypes: {},
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'AvatarGroup'
};

export default meta;

const SRC_URL_1 =
  'https://mir-s3-cdn-cf.behance.net/project_modules/disp/690bc6105945313.5f84bfc9de488.png';
const SRC_URL_2 = 'https://i.imgur.com/xIe7Wlb.png';


export const Example = (args: any) => (
  <AvatarGroup aria-label="Online users" {...args}>
    <Avatar alt="default adobe" src={SRC_URL_1} />
    <Avatar alt="default adobe" src={SRC_URL_1} />
    <Avatar alt="default adobe" src={SRC_URL_1} />
    <Avatar alt="design provided" src={SRC_URL_2} />
  </AvatarGroup>
);

export const WithLabel = (args: any) => (
  <AvatarGroup label="145 members" {...args}>
    <Avatar alt="default adobe" src={SRC_URL_1} />
    <Avatar alt="default adobe" src={SRC_URL_1} />
    <Avatar alt="default adobe" src={SRC_URL_1} />
    <Avatar alt="design provided" src={SRC_URL_2} />
  </AvatarGroup>
);

export const WithProviderBackground = (args: any) => (
  <Provider background="layer-1" styles={style({padding: 40})}>
    <AvatarGroup label="145 members" {...args}>
      <Avatar alt="default adobe" src={SRC_URL_1} />
      <Avatar alt="default adobe" src={SRC_URL_1} />
      <Avatar alt="default adobe" src={SRC_URL_1} />
      <Avatar alt="design provided" src={SRC_URL_2} />
    </AvatarGroup>
  </Provider>
);
