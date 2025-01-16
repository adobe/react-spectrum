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

import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Pressable} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('Pressable', function () {
  it('should apply press events to child element', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onPress = jest.fn();
    let {getByRole} = render(
      <Pressable onPress={onPress}>
        <button>Button</button>
      </Pressable>
    );

    let button = getByRole('button');
    await user.click(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should should merge with existing props, not overwrite', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onPress = jest.fn();
    let onClick = jest.fn();
    let {getByRole} = render(
      <Pressable onPress={onPress}>
        <button onClick={onClick}>Button</button>
      </Pressable>
    );

    let button = getByRole('button');
    await user.click(button);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
