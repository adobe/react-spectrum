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

import {act, fireEvent, render} from '@react-spectrum/test-utils-internal';
import {AttachmentGrid, AttachmentGridItem} from '@react-spectrum/ai';
import {Image} from '@react-spectrum/s2/Image';
import React from 'react';

// Conditionally skip the suite
const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;
describeOrSkip('AttachmentGrid', () => {
  it('should render as a non-interactive grid whose items are not focusable', () => {
    let {getByRole, getAllByRole} = render(
      <AttachmentGrid aria-label="Uploaded files">
        <AttachmentGridItem aria-label="one.pdf" textValue="one.pdf">
          <Image slot="thumbnail" src="https://example.com/image.png" />
        </AttachmentGridItem>
        <AttachmentGridItem aria-label="two.pdf" textValue="two.pdf">
          <Image slot="thumbnail" src="https://example.com/image.png" />
        </AttachmentGridItem>
      </AttachmentGrid>
    );

    // All options are disabled, so the grid itself becomes the sole tab stop, keeping the
    // overflow area keyboard-scrollable even though no individual attachment is focusable.
    let grid = getByRole('listbox');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveAttribute('tabIndex', '0');
    let options = getAllByRole('option');
    expect(options).toHaveLength(2);
    for (let option of options) {
      expect(option).toHaveAttribute('aria-disabled', 'true');
      expect(option).not.toHaveAttribute('tabIndex');
    }
    expect(grid).not.toHaveAttribute('aria-multiselectable');
  });

  it('should not intercept arrow keys, so the browser can natively scroll the grid', () => {
    let {getByRole} = render(
      <AttachmentGrid aria-label="Uploaded files">
        <AttachmentGridItem aria-label="one.pdf" textValue="one.pdf">
          <Image slot="thumbnail" src="https://example.com/image.png" />
        </AttachmentGridItem>
      </AttachmentGrid>
    );

    let grid = getByRole('listbox');
    act(() => grid.focus());
    expect(fireEvent.keyDown(grid, {key: 'ArrowDown'})).toBe(true);
    expect(fireEvent.keyDown(grid, {key: 'ArrowUp'})).toBe(true);
  });

  it('should focus the grid when a disabled attachment is clicked', () => {
    let {getByRole} = render(
      <AttachmentGrid aria-label="Uploaded files">
        <AttachmentGridItem aria-label="one.pdf" textValue="one.pdf">
          <Image slot="thumbnail" src="https://example.com/image.png" />
        </AttachmentGridItem>
      </AttachmentGrid>
    );

    let grid = getByRole('listbox');
    let option = getByRole('option');
    expect(grid).not.toHaveFocus();
    fireEvent.pointerDown(option);
    expect(grid).toHaveFocus();
  });
});
