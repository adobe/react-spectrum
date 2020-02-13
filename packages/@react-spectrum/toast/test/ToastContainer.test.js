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
import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {ToastProvider, useToastProvider} from '../';
import {triggerPress} from '@react-spectrum/test-utils';

function RenderToastButton() {
  let toastContext = useToastProvider();

  return (
    <div>
      <Button
        onPress={() => toastContext.neutral('Toast is default', {})}
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

describe('Toast', function () {
  afterEach(() => {
    cleanup();
  });

  it('Renders a button that triggers a toast via the provider', async function () {
    let {getByRole, queryAllByRole} = renderComponent(<RenderToastButton />);
    let button = getByRole('button');

    expect(() => {
      getByRole('alert');
    }).toThrow();

    triggerPress(button);

    expect(queryAllByRole('alert').length).toBe(1);
    expect(getByRole('alert')).toBeVisible();
  });
});
