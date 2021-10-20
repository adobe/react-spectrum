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

import {fireEvent} from '@testing-library/react';
import {Item} from '@react-stately/collections';
import React from 'react';
import {render} from '@testing-library/react';
import {TagGroup} from '../src';

describe('TagGroup', function () {
  let onRemoveSpy = jest.fn();

  afterEach(() => {
    onRemoveSpy.mockClear();
  });

  it('provides context for Tag component', function () {
    let {container} = render(
      <TagGroup aria-label="tag group" isRemovable onRemove={onRemoveSpy}>
        <Item aria-label="Tag 1">Tag 1</Item>
        <Item aria-label="Tag 2">Tag 2</Item>
        <Item aria-label="Tag 3">Tag 3</Item>
      </TagGroup>
    );

    let tags = container.querySelectorAll('[role="row"]');
    expect(tags.length).toBe(3);

    fireEvent.keyDown(tags[1], {key: 'Delete'});
    expect(onRemoveSpy).toHaveBeenCalledTimes(1);
    expect(onRemoveSpy).toHaveBeenCalledWith(tags[1]);
  });

  it.each`
   Name           | Component     | TagComponent | props
   ${'TagGroup'}  | ${TagGroup}   | ${Item}       | ${{isReadOnly: true, isRemovable: true, onRemove: onRemoveSpy}}
  `('$Name can be read only', ({Component, TagComponent, props}) => {
    let {getByText} = render(
      <Component
        {...props}
        aria-label="tag group">
        <TagComponent aria-label="Tag 1">Tag 1</TagComponent>
      </Component>
    );
    let tag = getByText('Tag 1');
    fireEvent.keyDown(tag, {key: 'Delete', keyCode: 46});
    expect(onRemoveSpy).not.toHaveBeenCalledWith('Tag 1', expect.anything());
  });

  it.each`
   Name           | Component         | TagComponent | props
   ${'TagGroup'}  | ${TagGroup}       | ${Item}      |${{}}
  `('$Name have correct accessibility roles', ({Component, TagComponent, props}) => {
    let {container, getByText} = render(
      <Component
        {...props}
        aria-label="tag group">
        <TagComponent aria-label="Tag 1">Tag 1</TagComponent>
      </Component>
    );
    let tagGroup = container.children[0];
    expect(tagGroup).toHaveAttribute('role', 'grid');
    let tag = tagGroup.children[0];
    expect(tag).toHaveAttribute('role', 'row');
    let tagContent = getByText('Tag 1');
    expect(tagContent).toHaveAttribute('role', 'gridcell');
  });
});
