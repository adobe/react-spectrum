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

import {Attachment, AttachmentList} from '@react-spectrum/ai';
import {fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Image} from '@react-spectrum/s2/Image';
import {Provider} from '@react-spectrum/s2/Provider';
import React from 'react';
import userEvent from '@testing-library/user-event';

// Conditionally skip the suite
const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;

function renderAttachments(count: number, wrap: (el: JSX.Element) => JSX.Element = el => el) {
  return render(
    wrap(
      <AttachmentList aria-label="Uploaded files">
        {Array.from({length: count}, (_, i) => (
          <Attachment key={i} aria-label={`file-${i}.pdf`} textValue={`file-${i}.pdf`}>
            <Image slot="thumbnail" src="https://example.com/image.png" />
          </Attachment>
        ))}
      </AttachmentList>
    )
  );
}

describeOrSkip('AttachmentList', () => {
  it('should render', () => {
    let {getByRole} = renderAttachments(1);
    expect(getByRole('grid')).toBeInTheDocument();
  });

  describe('carousel overflow', () => {
    let offsetWidthSpy, clientWidthSpy, scrollWidthSpy, scrollLeftSpy;

    afterEach(() => {
      offsetWidthSpy?.mockRestore();
      clientWidthSpy?.mockRestore();
      scrollWidthSpy?.mockRestore();
      scrollLeftSpy?.mockRestore();
      delete window.HTMLElement.prototype.scrollBy;
    });

    it('should switch to a carousel once attachments overflow the container width', () => {
      offsetWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get')
        .mockImplementation(() => 200);
      scrollWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollWidth', 'get')
        .mockImplementation(() => 800);

      let {getByRole} = renderAttachments(2);

      expect(getByRole('button', {name: 'Show previous attachments'})).toBeInTheDocument();
      expect(getByRole('button', {name: 'Show next attachments'})).toBeInTheDocument();
    });

    it('should not render carousel nav when attachments fit', () => {
      offsetWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get')
        .mockImplementation(() => 800);
      scrollWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollWidth', 'get')
        .mockImplementation(() => 200);

      let {queryByRole} = renderAttachments(1);

      expect(queryByRole('button', {name: 'Show previous attachments'})).not.toBeInTheDocument();
    });

    it("should not get stuck in carousel mode from the nav buttons shrinking the track's own width", () => {
      offsetWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get')
        .mockImplementation(function (this: HTMLElement) {
          return this.getAttribute('role') === 'grid' ? 650 : 700;
        });
      scrollWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollWidth', 'get')
        .mockImplementation(() => 690);

      let {queryByRole} = renderAttachments(2);

      expect(queryByRole('button', {name: 'Show previous attachments'})).not.toBeInTheDocument();
    });

    it('should disable "previous" at the natural resting start position, even when it is not scrollLeft 0', () => {
      offsetWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get')
        .mockImplementation(() => 200);
      clientWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'clientWidth', 'get')
        .mockImplementation(() => 200);
      scrollWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollWidth', 'get')
        .mockImplementation(() => 800);
      scrollLeftSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollLeft', 'get')
        .mockImplementation(() => 12);

      let {getByRole} = renderAttachments(2);

      expect(getByRole('button', {name: 'Show previous attachments'})).toBeDisabled();
      expect(getByRole('button', {name: 'Show next attachments'})).not.toBeDisabled();
    });

    it('should disable "next" at the natural resting end position', () => {
      // Mirror of the "previous"-at-start test above, for the end boundary.
      offsetWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get')
        .mockImplementation(() => 200);
      clientWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'clientWidth', 'get')
        .mockImplementation(() => 200);
      scrollWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollWidth', 'get')
        .mockImplementation(() => 800);
      scrollLeftSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollLeft', 'get')
        .mockImplementation(() => 600);

      let {getByRole} = renderAttachments(2);

      expect(getByRole('button', {name: 'Show next attachments'})).toBeDisabled();
      expect(getByRole('button', {name: 'Show previous attachments'})).not.toBeDisabled();
    });

    it('should recalculate carousel mode when the container is resized', () => {
      let fits = true;
      offsetWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get')
        .mockImplementation(() => (fits ? 800 : 200));
      scrollWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollWidth', 'get')
        .mockImplementation(() => 700);

      let {queryByRole} = renderAttachments(2);

      expect(queryByRole('button', {name: 'Show previous attachments'})).not.toBeInTheDocument();

      fits = false;
      fireEvent(window, new Event('resize'));

      expect(queryByRole('button', {name: 'Show previous attachments'})).toBeInTheDocument();
    });

    it('should scroll toward the start (positive delta) when RTL and "previous" is pressed', async () => {
      let user = userEvent.setup({delay: null, pointerMap});
      offsetWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get')
        .mockImplementation(() => 200);
      clientWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'clientWidth', 'get')
        .mockImplementation(() => 200);
      scrollWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollWidth', 'get')
        .mockImplementation(() => 800);
      // Simulate having scrolled in, so "previous" isn't disabled at the start boundary.
      let scrollLeftValue = 0;
      scrollLeftSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollLeft', 'get')
        .mockImplementation(() => scrollLeftValue);
      let scrollBy = jest.fn();
      window.HTMLElement.prototype.scrollBy = scrollBy;

      let {getByRole} = renderAttachments(2, el => <Provider locale="ar-AE">{el}</Provider>);

      scrollLeftValue = -300;
      fireEvent.scroll(getByRole('grid'));

      await user.click(getByRole('button', {name: 'Show previous attachments'}));
      // RTL's negative-scrollLeft convention means "toward the start" is a positive delta,
      // the opposite of LTR.
      expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({left: expect.any(Number)}));
      expect(scrollBy.mock.calls[0][0].left).toBeGreaterThan(0);
    });

    it('should scroll in the opposite direction for "previous" vs "next" when LTR', async () => {
      let user = userEvent.setup({delay: null, pointerMap});
      offsetWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get')
        .mockImplementation(() => 200);
      clientWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'clientWidth', 'get')
        .mockImplementation(() => 200);
      scrollWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollWidth', 'get')
        .mockImplementation(() => 800);
      // Simulate having already scrolled in, so neither button is disabled at a boundary.
      scrollLeftSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollLeft', 'get')
        .mockImplementation(() => 300);
      let scrollBy = jest.fn();
      window.HTMLElement.prototype.scrollBy = scrollBy;

      let {getByRole} = renderAttachments(2);

      await user.click(getByRole('button', {name: 'Show next attachments'}));
      expect(scrollBy.mock.calls[0][0].left).toBeGreaterThan(0);

      await user.click(getByRole('button', {name: 'Show previous attachments'}));
      expect(scrollBy.mock.calls[1][0].left).toBeLessThan(0);
    });
  });
});
