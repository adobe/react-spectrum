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

import React, {JSX} from 'react';
import {StoryFn} from '@storybook/react';
import {ToastContainer} from './Example';
import {ToastStateProps} from '@react-stately/toast';

export default {
  title: 'useToast',
  args: {
    maxVisibleToasts: 1,
    timeout: null
  },
  argTypes: {
    timeout: {
      control: 'radio',
      options: [null, 5000] as const
    }
  }
};

let count = 0;

let ToastStory = (props: ToastStateProps & {timeout?: number}): JSX.Element => (
  <ToastContainer {...props}>
    {state => (<>
      <button onClick={() => state.add('Mmmmm toast ' + ++count, {timeout: props.timeout})}>Add toast</button>
    </>)}
  </ToastContainer>
);

export const Default: StoryFn<typeof ToastStory> = args => <ToastStory {...args} />;
