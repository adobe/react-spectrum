/*
 * Copyright 2022 Adobe. All rights reserved.
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
import {Label} from '../src/Label';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('Label', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('should support hover events', async () => {
    let hoverStartSpy = jest.fn();
    let hoverChangeSpy = jest.fn();
    let hoverEndSpy = jest.fn();
    let {getByText} = render(
      <Label onHoverStart={hoverStartSpy} onHoverChange={hoverChangeSpy} onHoverEnd={hoverEndSpy}>
        Test Label
      </Label>
    );
    let label = getByText('Test Label');

    await user.hover(label);
    expect(hoverStartSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenLastCalledWith(true);

    await user.unhover(label);
    expect(hoverEndSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(2);
    expect(hoverChangeSpy).toHaveBeenLastCalledWith(false);
  });

  it('should render as a label element by default', () => {
    let {getByText} = render(<Label>Test Label</Label>);
    let label = getByText('Test Label');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveClass('react-aria-Label');
  });
});
