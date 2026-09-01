/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Alert} from '@react-spectrum/ai';
import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import userEvent from '@testing-library/user-event';

// Conditionally skip the suite
const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;
describeOrSkip('Alert', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('renders children with role="alert"', () => {
    let {getByRole} = render(<Alert>Alert description</Alert>);
    expect(getByRole('alert')).toHaveTextContent('Alert description');
  });

  it('renders no variant icon for the default neutral variant, only the close button icon', () => {
    let {container} = render(<Alert>Alert description</Alert>);
    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });

  it('renders a variant icon in addition to the close button icon', () => {
    let {container} = render(<Alert variant="negative">Alert description</Alert>);
    expect(container.querySelectorAll('svg')).toHaveLength(2);
  });

  it('fires onDismiss when the close button is pressed', async () => {
    let onDismiss = jest.fn();
    let {getByRole} = render(
      <Alert onDismiss={onDismiss}>Alert description</Alert>
    );

    await user.click(getByRole('button', {name: 'Dismiss'}));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
