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

import {Avatar} from '../src';
import {style} from '../style/spectrum-theme' with { type: 'macro' };
import type {Meta} from '@storybook/react';

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  argTypes: {},
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

const SRC_URL_1 =
  'https://mir-s3-cdn-cf.behance.net/project_modules/disp/690bc6105945313.5f84bfc9de488.png';
const SRC_URL_2 = 'https://i.imgur.com/xIe7Wlb.png';


export const Example = (args: any) => (
  <>
    <Avatar alt="default adobe" src={SRC_URL_1} {...args} />
    <Avatar alt="design provided" src={SRC_URL_2} {...args} />
  </>
);

export const UserAppliedSize = (args: any) => (
  <>
    <Avatar alt="default adobe" src={SRC_URL_1} styles={style({size: 40})} {...args} />
    <Avatar alt="design provided" src={SRC_URL_2} styles={style({size: 40})} {...args} />
  </>
);
