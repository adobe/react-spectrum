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


import {Compact, Default, IsDisabled, IsEmphasized, IsQuiet, StaticColorBlack, StaticColorWhite} from '../chromatic/ActionGroup.stories';
import {Flex} from '@react-spectrum/layout';
import React from 'react';

export default {
  title: 'ActionGroup'
};

export const All = () => (
  <Flex gap="size-100" direction={'column'}>
    <h2>default</h2>
    <Default />
    <h2>isDisabled</h2>
    <IsDisabled />
    <h2>compact</h2>
    <Compact />
    <h2>isQuiet</h2>
    <IsQuiet />
    <h2>isEmphasized</h2>
    <IsEmphasized />
    <h2>staticColor: black</h2>
    <StaticColorBlack />
    <h2>staticColor: white</h2>
    <StaticColorWhite />
  </Flex>
);
All.story = {
  name: 'all'
};
