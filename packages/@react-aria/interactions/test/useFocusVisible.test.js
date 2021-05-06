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

import {fireEvent} from '@testing-library/react';
import React from 'react';
import {renderHook} from '@testing-library/react-hooks';
import {useFocusEmitter} from '../';

describe('useFocusEmitter', function () {
  it('emits on modality change', function () {
    let fnMock = jest.fn();
    renderHook(() => useFocusEmitter(fnMock, []));
    expect(fnMock).toHaveBeenCalledTimes(0);
    fireEvent.keyDown(document.body, {key: 'Escape'});
    expect(fnMock).toHaveBeenCalledTimes(1);
    expect(fnMock.mock.calls[0][0]).toBeTruthy();
    expect(fnMock.mock.calls[0][1]).toEqual('keyboard');
    fireEvent.mouseDown(document.body);
    expect(fnMock).toHaveBeenCalledTimes(2);
    expect(fnMock.mock.calls[1][0]).toBeFalsy();
    expect(fnMock.mock.calls[1][1]).toEqual('pointer');
  });
});
