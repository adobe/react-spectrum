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

import {AllStates} from '../chromatic/CalendarCell.stories';
import {Flex} from '@react-spectrum/layout';
import React from 'react';

export default {
  title: 'CalendarCell'
};

export const All = () => (
  <Flex gap="size-100" direction={'column'}>
    <h2>All States</h2>
    <AllStates />
  </Flex>
);
All.story = {
  name: 'all'
};
