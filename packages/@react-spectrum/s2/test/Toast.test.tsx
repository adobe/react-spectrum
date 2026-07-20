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

import {act, installPointerEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Button} from '../src/Button';
import {ToastContainer, ToastOptions, ToastQueue} from '../src/Toast';
import userEvent from '@testing-library/user-event';

function Example(options: ToastOptions = {}) {
  return (
    <>
      <ToastContainer />
      <Button variant="primary" onPress={() => ToastQueue.neutral('Toast', options)}>
        Show Toast
      </Button>
    </>
  );
}

describe('Toast', () => {
  installPointerEvent();

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

  it('passes an id and data attribute through to the rendered toast', async () => {
    let {getByRole, getByTestId} = render(
      // @ts-ignore
      <Example id="toast-1" data-testid="toast-1" />
    );

    let button = getByRole('button');
    await user.click(button);

    let toast = getByRole('alertdialog');
    expect(toast).toBeVisible();
    expect(toast).toHaveAttribute('id', 'toast-1');
    expect(toast).toHaveAttribute('data-testid', 'toast-1');
    expect(getByTestId('toast-1')).toBe(toast);
  });
});
