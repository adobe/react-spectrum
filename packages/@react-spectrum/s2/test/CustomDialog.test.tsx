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
import {ActionButton, CustomDialog, DialogTrigger, Tag, TagGroup} from '../src';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('CustomDialog', () => {
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

  it('should allow you to render a taggroup inside', async () => {
    let {getByRole} = render(
      <DialogTrigger>
        <ActionButton>Open dialog</ActionButton>
        <CustomDialog isDismissible>
          <TagGroup
            label="Ice cream categories"
            maxRows={1}
            onRemove={() => {}}>
            <Tag>Chocolate</Tag>
            <Tag>Mint</Tag>
            <Tag>Strawberry</Tag>
            <Tag>Vanilla</Tag>
          </TagGroup>
        </CustomDialog>
      </DialogTrigger>
    );

    let trigger = getByRole('button');
    await user.click(trigger);
    act(() => {jest.runAllTimers();});
    expect(getByRole('dialog')).toBeVisible();
  });
});
