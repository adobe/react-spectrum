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

import {renderHook} from '@react-spectrum/test-utils';
import {useRef} from 'react';
import {useToast} from '../';

describe('useToast', () => {
  let close = jest.fn();

  afterEach(() => {
    close.mockClear();
  });

  let renderToastHook = (toast, state, wrapper) => {
    let {result} = renderHook(() => useToast({toast}, state, useRef(document.createElement('div'))), {wrapper});
    return result.current;
  };

  it('handles defaults', function () {
    let {closeButtonProps, toastProps, contentProps, titleProps} = renderToastHook({}, {close});

    expect(toastProps.role).toBe('alertdialog');
    expect(contentProps.role).toBe('alert');
    expect(closeButtonProps['aria-label']).toBe('Close');
    expect(typeof closeButtonProps.onPress).toBe('function');
    expect(titleProps.id).toEqual(toastProps['aria-labelledby']);
  });

  it('handles close button', function () {
    let {closeButtonProps} = renderToastHook({key: 1}, {close});
    closeButtonProps.onPress();

    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith(1);
  });
});
