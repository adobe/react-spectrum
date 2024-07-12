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

import {Button, Label, Tag, TagGroup, TagGroupProps, TagList, TagProps} from 'react-aria-components';
import React from 'react';

export default {
  title: 'React Aria Components'
};

export const TagGroupExample = (props: TagGroupProps) => (
  <TagGroup {...props} disabledKeys={new Set([2])} onRemove={console.log}>
    <Label>Categories</Label>
    <TagList style={{display: 'flex', gap: 4}}>
      <MyTag id={1} href="https://nytimes.com">News</MyTag>
      <MyTag id={2}>Travel</MyTag>
      <MyTag id={3}>Gaming</MyTag>
      <MyTag id={4}>Shopping</MyTag>
    </TagList>
  </TagGroup>
);

TagGroupExample.args = {
  selectionMode: 'none',
  selectionBehavior: 'toggle'
};

TagGroupExample.argTypes = {
  selectionMode: {
    control: {
      type: 'inline-radio',
      options: ['none', 'single', 'multiple']
    }
  },
  selectionBehavior: {
    control: {
      type: 'inline-radio',
      options: ['toggle', 'replace']
    }
  }
};

function MyTag(props: TagProps) {
  return (
    <Tag
      {...props}
      style={({isSelected}) => ({border: '1px solid gray', borderRadius: 4, padding: '0 4px', background: isSelected ? 'black' : '', color: isSelected ? 'white' : '', cursor: props.href ? 'pointer' : 'default'})}>
      {props.children}
      <Button slot="remove">x</Button>
    </Tag>
  );
}
