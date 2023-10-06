/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Avatar} from '..';
import {Flex} from '@react-spectrum/layout';
import React from 'react';

const SRC_URL_1 =
  'https://mir-s3-cdn-cf.behance.net/project_modules/disp/690bc6105945313.5f84bfc9de488.png';
const SRC_URL_2 = 'https://i.imgur.com/xIe7Wlb.png';

export default {
  title: 'Avatar'
};

export const all = () => (
  <Flex gap="size-100" direction={'column'}>
    <h2>Default</h2>
    <Avatar src={SRC_URL_1} />
    <h2>Disabled</h2>
    <Avatar src={SRC_URL_1} isDisabled />
    <h2>Custom size</h2>
    <Avatar src={SRC_URL_2} size={'avatar-size-700'} />
  </Flex>
);

