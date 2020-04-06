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

import {Button} from '@react-spectrum/button';
import {cleanup, render, waitForDomChange} from '@testing-library/react';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {ToastContainer, ToastProvider, useToastProvider} from '../';
import {triggerPress} from '@react-spectrum/test-utils';

function RenderToastButton(props = {}) {
  let toastContext = useToastProvider();

  return (
    <div>
      <Button
        onPress={() => toastContext.neutral('Toast is default', props)}
        variant="primary">
          Show Default Toast
      </Button>
    </div>
  );
}

function renderComponent(contents) {
  return render(<ToastProvider>
    {contents}
  </ToastProvider>);
}

describe.skip('Toast Provider and Container', function () {
  afterEach(() => {
    cleanup();
  });

  it('Renders a button that triggers a toast via the provider', async () => {
    let {getByRole, queryAllByRole} = renderComponent(<RenderToastButton />);
    let button = getByRole('button');

    expect(() => {
      getByRole('alert');
    }).toThrow();

    triggerPress(button);

    expect(queryAllByRole('alert').length).toBe(1);
    expect(getByRole('alert')).toBeVisible();
  });

  it('get position from provider', async () => {
    let {getByTestId} = renderComponent(
      <Provider toastPlacement="top left" theme={{light: {}, medium: {}}}>
        <ToastContainer toasts={[]} data-testid="testId1">Toast</ToastContainer>
      </Provider>);

    let className = getByTestId('testId1').className;
    expect(className.includes('react-spectrum-ToastContainer--top')).toBeTruthy();
    expect(className.includes('react-spectrum-ToastContainer--left')).toBeTruthy();
  });

  it('removes a toast via timeout', async () => {
    let {getByRole} = renderComponent(<RenderToastButton timeout={1} />);
    let button = getByRole('button');

    triggerPress(button);

    // confirm toast is there, wait for it disappear, then confirm it is gone
    let toasts = getByRole('alert');
    expect(toasts).toBeVisible();

    await waitForDomChange();

    expect(() => {
      getByRole('alert');
    }).toThrow();
  });
});
