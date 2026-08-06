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

import {PromptField, PromptTokenField} from '../src/PromptField';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import userEvent from '@testing-library/user-event';

const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;
describeOrSkip('PromptField', () => {
  let user;

  beforeAll(() => {
    user = userEvent.setup({delay: null});
  });

  it('fires onKeyDown when a key is pressed in the token field', async () => {
    let onKeyDown = jest.fn();
    let {getByRole} = render(
      <PromptField>
        <PromptTokenField onKeyDown={onKeyDown} />
      </PromptField>
    );

    let input = getByRole('textbox');
    await user.click(input);
    await user.keyboard('a');

    expect(onKeyDown).toHaveBeenCalled();
  });
});
