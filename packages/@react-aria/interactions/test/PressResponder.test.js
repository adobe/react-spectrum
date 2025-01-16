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
import {Pressable, PressResponder} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('PressResponder', function () {
  it('should handle press events on nested pressable children', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onPress = jest.fn();
    let {getByRole} = render(
      <PressResponder onPress={onPress}>
        <div>
          <Pressable><button>Button</button></Pressable>
        </div>
      </PressResponder>
    );

    let button = getByRole('button');
    await user.click(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should handle forward refs to nested pressable children', function () {
    let ref = React.createRef();
    let {getByRole} = render(
      <PressResponder ref={ref}>
        <div>
          <Pressable><button>Button</button></Pressable>
        </div>
      </PressResponder>
    );

    let button = getByRole('button');
    expect(ref.current).toBe(button);
  });

  it('should warn if there is no pressable child', function () {
    let warn = jest.spyOn(global.console, 'warn').mockImplementation();
    render(
      <PressResponder>
        <div>
          <button>Button</button>
        </div>
      </PressResponder>
    );

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('should not warn if there is a pressable child', function () {
    let warn = jest.spyOn(global.console, 'warn').mockImplementation();
    render(
      <PressResponder>
        <div>
          <Pressable><button>Button</button></Pressable>
        </div>
      </PressResponder>
    );

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('should merge with existing props, not overwrite', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onPress = jest.fn();
    let onClick = jest.fn();
    let {getByRole} = render(
      <PressResponder>
        <div>
          <Pressable onPress={onPress}>
            <button onClick={onClick}>Button</button>
          </Pressable>
        </div>
      </PressResponder>
    );

    let button = getByRole('button');
    await user.click(button);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
