/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from 'react';
import {ToastContainer} from './Example';

export default {
  title: 'useToast',
  args: {
    maxVisibleToasts: 1,
    timeout: null
  },
  argTypes: {
    timeout: {
      control: 'radio',
      options: [null, 5000]
    }
  }
};

let count = 0;

export const Default = args => (
  <ToastContainer {...args}>
    {state => (<>
      <button onClick={() => state.add('High ' + ++count, {priority: 10, timeout: args.timeout})}>Add high priority toast</button>
      <button onClick={() => state.add('Medium ' + ++count, {priority: 5, timeout: args.timeout})}>Add medium priority toast</button>
      <button onClick={() => state.add('Low ' + ++count, {priority: 1, timeout: args.timeout})}>Add low priority toast</button>
    </>)}
  </ToastContainer>
);
