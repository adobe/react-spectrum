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

import {Item, Section, Tree} from '../src';
import React from 'react';

interface ItemType {
  name: string,
  children?: ItemType[]
}

let items: ItemType[] = [
  {name: 'Animals', children: [{name: 'Aardvark'}, {name: 'Kangaroo'}, {name: 'Snake'}]},
  {
    name: 'People',
    children: [
      {name: 'Danni'},
      {name: 'Devon'},
      {name: 'Ross', children: [{name: 'Tests'}]}
    ]
  }
];

let longList: ItemType[] = [];
for (let i = 0; i < 1000; i++) {
  longList.push({name: 'Item ' + i});
}

export default {
  title: 'Tree'
};

export const Default = () => (
  <Tree items={items} onSelectionChange={(keys) => console.log(keys)}>
    {(item) => (
      <Item key={item.name} childItems={item.children}>
        {item.name}
      </Item>
    )}
  </Tree>
);

export const Sections = () => (
  <Tree items={items}>
    {(item) => (
      <Section key={item.name} items={item.children} title={item.name}>
        {(item) => (
          <Item key={item.name} childItems={item.children}>
            {item.name}
          </Item>
        )}
      </Section>
    )}
  </Tree>
);

export const Static = () => (
  <Tree>
    <Item>One</Item>
    <Item>Two</Item>
    <Item title="Three">
      <Item>Four</Item>
      <Item title="Five">
        <Item>Six</Item>
      </Item>
    </Item>
  </Tree>
);

export const StaticSections = () => (
  <Tree>
    <Section title="Section 1">
      <Item>One</Item>
      <Item>Two</Item>
      <Item>Three</Item>
    </Section>
    <Section title="Section 2">
      <Item>One</Item>
      <Item>Two</Item>
      <Item>Three</Item>
    </Section>
  </Tree>
);

StaticSections.story = {
  name: 'Static sections'
};

export const LongList = () => (
  <div>
    <input />
    <Tree items={longList}>
      {(item) => <Item key={item.name}>{item.name}</Item>}
    </Tree>
    <input />
  </div>
);

LongList.story = {
  name: 'Long list'
};
