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

import {act, pointerMap, render, renderHook, within} from '@react-spectrum/test-utils-internal';
import {composeStories} from '@storybook/react';
import React, {useRef} from 'react';
import * as stories from '../stories/useToast.stories';
import userEvent from '@testing-library/user-event';
import {useToast} from '../';

let {Default} = composeStories(stories);

describe('useToast', () => {
  let close = jest.fn();

  afterEach(() => {
    close.mockClear();
  });

  let renderToastHook = (props, state, wrapper) => {
    let {result} = renderHook(() => useToast(props, state, useRef(document.createElement('div'))), {wrapper});
    return result.current;
  };

  it('handles defaults', function () {
    let {closeButtonProps, toastProps, contentProps, titleProps} = renderToastHook({toast: {}}, {close});

    expect(toastProps.role).toBe('alertdialog');
    expect(contentProps.role).toBe('alert');
    expect(closeButtonProps['aria-label']).toBe('Close');
    expect(typeof closeButtonProps.onPress).toBe('function');
    expect(titleProps.id).toEqual(toastProps['aria-labelledby']);
  });

  it('handles close button', function () {
    let {closeButtonProps} = renderToastHook({toast: {key: 1}}, {close});
    closeButtonProps.onPress();

    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith(1);
  });

  it('passes through data attributes', function () {
    let {toastProps} = renderToastHook({toast: {}, 'data-test-id': 'toast'}, {close});

    expect(toastProps['data-test-id']).toBe('toast');
  });
});

describe('single toast at a time', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => jest.runAllTimers());
  });

  it('moves focus to the next toast when it appears', async () => {
    let tree = render(<Default />);
    let button = tree.getByRole('button');

    await user.tab();
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');

    let toast = tree.getByRole('alertdialog');
    expect(toast.textContent).toContain('Mmmmm toast 2x');
    let closeButton = within(toast).getByRole('button');
    await user.keyboard('{F6}');
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(closeButton);
    await user.keyboard('{Enter}');

    toast = tree.getByRole('alertdialog');
    expect(toast.textContent).toContain('Mmmmm toast 1x');
    expect(toast).toHaveFocus();

    closeButton = within(toast).getByRole('button');
    await user.tab();
    expect(document.activeElement).toBe(closeButton);
    await user.keyboard('{Enter}');

    expect(tree.queryByRole('alertdialog')).toBeNull();
    expect(button).toHaveFocus();
  });
});
