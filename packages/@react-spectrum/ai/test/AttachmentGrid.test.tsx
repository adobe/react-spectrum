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

import {AttachmentGrid, AttachmentGridItem} from '@react-spectrum/ai';
import {Image} from '@react-spectrum/s2/Image';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import userEvent from '@testing-library/user-event';

// Conditionally skip the suite
const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;
describeOrSkip('AttachmentGrid', () => {
  it('should use a single tab stop with arrow key navigation between attachments', async () => {
    let user = userEvent.setup({delay: null});
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

    let grid = getByRole('listbox');
    expect(grid).toBeInTheDocument();
    expect(grid).not.toHaveAttribute('aria-multiselectable');

    let [firstOption, secondOption] = getAllByRole('option');

    await user.tab();
    expect(document.activeElement).toBe(firstOption);
    expect(firstOption.tabIndex).toBe(0);
    expect(secondOption.tabIndex).toBe(-1);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(secondOption);
    expect(firstOption.tabIndex).toBe(-1);
    expect(secondOption.tabIndex).toBe(0);
  });

  it('should call onAction when an attachment is clicked or activated with the keyboard', async () => {
    let user = userEvent.setup({delay: null});
    let onAction = jest.fn();
    let {getByRole} = render(
      <AttachmentGrid aria-label="Uploaded files">
        <AttachmentGridItem aria-label="one.pdf" textValue="one.pdf" onAction={onAction}>
          <Image slot="thumbnail" src="https://example.com/image.png" />
        </AttachmentGridItem>
      </AttachmentGrid>
    );

    let option = getByRole('option');

    await user.click(option);
    expect(onAction).toHaveBeenCalledTimes(1);

    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledTimes(2);
  });

  it('should call onAction on the grid with the key of the activated attachment', async () => {
    let user = userEvent.setup({delay: null});
    let onAction = jest.fn();
    let {getAllByRole} = render(
      <AttachmentGrid aria-label="Uploaded files" onAction={onAction}>
        <AttachmentGridItem id="one" aria-label="one.pdf" textValue="one.pdf">
          <Image slot="thumbnail" src="https://example.com/image.png" />
        </AttachmentGridItem>
        <AttachmentGridItem id="two" aria-label="two.pdf" textValue="two.pdf">
          <Image slot="thumbnail" src="https://example.com/image.png" />
        </AttachmentGridItem>
      </AttachmentGrid>
    );

    let [firstOption, secondOption] = getAllByRole('option');

    await user.click(secondOption);
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenLastCalledWith('two');

    await user.keyboard('{ArrowLeft}{Enter}');
    expect(document.activeElement).toBe(firstOption);
    expect(onAction).toHaveBeenCalledTimes(2);
    expect(onAction).toHaveBeenLastCalledWith('one');
  });
});
