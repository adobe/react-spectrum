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

import {Label, OverlayArrow, Tag, TagGroup, TagGroupProps, TagList, TagProps, Tooltip, TooltipTrigger} from 'react-aria-components';
import React from 'react';

export default {
  title: 'React Aria Components'
};

export const TagGroupExample = (props: TagGroupProps) => (
  <TagGroup {...props}>
    <Label>Categories</Label>
    <TagList style={{display: 'flex', gap: 4}}>
      <MyTag href="https://nytimes.com">News</MyTag>
      <MyTag>Travel</MyTag>
      <MyTag>Gaming</MyTag>
      <TooltipTrigger>
        <MyTag>Shopping</MyTag>
        <Tooltip
          offset={5}
          style={{
            background: 'Canvas',
            color: 'CanvasText',
            border: '1px solid gray',
            padding: 5,
            borderRadius: 4
          }}>
          <OverlayArrow style={{transform: 'translateX(-50%)'}}>
            <svg width="8" height="8" style={{display: 'block'}}>
              <path d="M0 0L4 4L8 0" fill="white" strokeWidth={1} stroke="gray" />
            </svg>
          </OverlayArrow>
          I am a tooltip
        </Tooltip>
      </TooltipTrigger>
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
      style={({isSelected}) => ({border: '1px solid gray', borderRadius: 4, padding: '0 4px', background: isSelected ? 'black' : '', color: isSelected ? 'white' : '', cursor: props.href ? 'pointer' : 'default'})} />
  );
}
