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

import {Breadcrumbs, Item} from '../';
import {Meta} from '@storybook/react';
import React from 'react';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Breadcrumbs',
  component: Breadcrumbs
};

export default meta;


export const Default = {
  args: {
    children: [
      <Item key="Folder 1">The quick brown fox jumps over</Item>,
      <Item key="Folder 2">My Documents</Item>,
      <Item key="Folder 3">Kangaroos jump high</Item>,
      <Item key="Folder 4">Koalas are very cute</Item>,
      <Item key="Folder 5">Wombat's noses</Item>,
      <Item key="Folder 6">Wattle trees</Item>,
      <Item key="Folder 7">April 7</Item>
    ]
  }
};

export const IsMultiline = {
  args: {...Default.args, isMultiline: true}
};

export const SizeS = {
  args: {...Default.args, size: 'S'}
};

export const SizeM = {
  args: {...Default.args, size: 'M'}
};

export const Truncated = {
  decorators: [
    (Story) => (
      <div style={{width: '100px'}}>
        <Story />
      </div>
    )
  ],
  args: {...Default.args}
};

export const ShowRoot = {
  args: {...Default.args, showRoot: true}
};
