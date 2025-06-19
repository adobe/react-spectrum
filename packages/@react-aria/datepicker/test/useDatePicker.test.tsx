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

import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import {ProgrammaticSetValueExampleRender} from '../stories/useDatePicker.stories';
import React, {} from 'react';
import userEvent from '@testing-library/user-event';

describe('useDatePicker', function () {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  it('should commit programmatically setValue when field is empty', async () => {
    let {getByTestId} = render(<ProgrammaticSetValueExampleRender />);

    expect(getByTestId('field')).toHaveTextContent('mm/dd/yyyy');
    await user.click(getByTestId('set'));
    expect(getByTestId('field')).toHaveTextContent('2020');
  });
});
