/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import {Tag, TagGroup} from '../src';
import userEvent from '@testing-library/user-event';


let TestTagGroup = ({tagGroupProps, itemProps}) => (
  <TagGroup data-testid="group" {...tagGroupProps}>
    <Tag {...itemProps} id="cat">Cat</Tag>
    <Tag {...itemProps} id="dog">Dog</Tag>
    <Tag {...itemProps} id="kangaroo">Kangaroo</Tag>
  </TagGroup>
);

let renderTagGroup = (tagGroupProps = {}, itemProps = {}) => render(<TestTagGroup {...{tagGroupProps, itemProps}} />);


describe('TagGroup', () => {
  let user;
  beforeAll(() => {
    jest.useFakeTimers();
    user = userEvent.setup({delay: null, pointerMap});
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => jest.runAllTimers());
  });

  afterAll(function () {
    jest.restoreAllMocks();
  });

  it('remove button should work', async () => {
    let onRemove = jest.fn();
    let {getAllByLabelText} = render(
      <TagGroup
        label="Ice cream categories"
        size="M"
        onRemove={onRemove}>
        <Tag id="chocolate">Chocolate</Tag>
        <Tag id="mint">Mint</Tag>
        <Tag id="strawberry">Strawberry</Tag>
        <Tag id="vanilla">Vanilla</Tag>
      </TagGroup>
    );

    let removeButtons = getAllByLabelText('Remove');
    expect(removeButtons).toHaveLength(4);
    await user.click(removeButtons[0]);
    act(() => {jest.runAllTimers();});
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith(new Set(['chocolate']));
  });

  it('should aria label on tags', () => {
    let {getAllByRole} = renderTagGroup({label: 'TagGroup label'}, {'aria-label': 'Test'});

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('aria-label', 'Test');
    }
  });
});
