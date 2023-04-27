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

import {Item} from '@react-stately/collections';
import React from 'react';
import {Tabs} from './example';

const meta = {
  title: 'useTabList'
};

export default meta;

let lotsOfItems: any[] = [];
for (let i = 0; i < 50; i++) {
  lotsOfItems.push({name: 'Item ' + i, contents: 'Contents ' + i});
}

const Template = (props) => (
  <Tabs aria-label="example" items={lotsOfItems} {...props}>
    {(item) => (
      <Item key={item.name} title={item.name}>
        {item.contents}
      </Item>
    )}
  </Tabs>
);

export const ScrollTesting = {
  render: Template
};

export const OnPressEndSelection = {
  render: Template,
  args: {shouldSelectOnPressUp: true}
};
