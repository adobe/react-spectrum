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

import {Button} from '@react-spectrum/button';
import {FileTrigger, FileTriggerProps} from 'react-aria-components';
import {Link} from '@react-spectrum/link';
import {Meta} from '@storybook/react';
import React from 'react';

type StoryArgs = FileTriggerProps;

const meta: Meta<StoryArgs> = {
  title: 'FileTrigger',
  component: FileTrigger
};

export default meta;

export const DefaultWithButton = {
  render: (args) => (
    <FileTrigger {...args} >
      <Button variant={'accent'}>Upload</Button>
    </FileTrigger>
  )
};

export const DefaultWithLink = {
  render: (args) => (
    <FileTrigger {...args} >
      <Link>Upload</Link>
    </FileTrigger>
  )
};
