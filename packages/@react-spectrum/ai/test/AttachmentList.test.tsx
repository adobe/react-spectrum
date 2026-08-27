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
describeOrSkip('AttachmentList', () => {
  it('should render', () => {
    let {getByRole} = render(
      <AttachmentList aria-label="Uploaded files">
        <Attachment aria-label="Demo file.pdf" textValue="Demo file.pdf">
          <Image slot="thumbnail" src="https://example.com/image.png" />
        </Attachment>
      </AttachmentList>
    );

    expect(getByRole('grid')).toBeInTheDocument();
  });

  describe('carousel overflow', () => {
    let offsetWidthSpy, clientWidthSpy, scrollWidthSpy;

    afterEach(() => {
      offsetWidthSpy?.mockRestore();
      clientWidthSpy?.mockRestore();
      scrollWidthSpy?.mockRestore();
    });

    it('should switch to a carousel once attachments overflow the container width', () => {
      offsetWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get')
        .mockImplementation(() => 200);
      scrollWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollWidth', 'get')
        .mockImplementation(() => 800);

      let {getByRole} = render(
        <AttachmentList aria-label="Uploaded files">
          <Attachment aria-label="one.pdf" textValue="one.pdf">
            <Image slot="thumbnail" src="https://example.com/image.png" />
          </Attachment>
          <Attachment aria-label="two.pdf" textValue="two.pdf">
            <Image slot="thumbnail" src="https://example.com/image.png" />
          </Attachment>
        </AttachmentList>
      );

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

      let {queryByRole} = render(
        <AttachmentList aria-label="Uploaded files">
          <Attachment aria-label="one.pdf" textValue="one.pdf">
            <Image slot="thumbnail" src="https://example.com/image.png" />
          </Attachment>
        </AttachmentList>
      );

      expect(queryByRole('button', {name: 'Show previous attachments'})).not.toBeInTheDocument();
    });

    it('should not overflow just because the carousel nav buttons would take up their own space', () => {
      // Regression test: comparing the track's own (post-button) width against itself, or against
      // a container whose width shrinks once carousel mode reserves room for the nav buttons, can
      // create a feedback loop - entering carousel mode eats just enough space that the content
      // "still" doesn't fit, keeping it stuck on forever. Content that fits the *outer* box just
      // fine (independent of whether buttons are shown) should never trigger the carousel.
      // The track (role="grid") reports a smaller offsetWidth than the outer box, as it would once
      // nav buttons reserve their own room - only comparing scrollWidth against the *outer* box's
      // width (not the track's own) avoids the feedback loop, so this must mock them differently.
      offsetWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get')
        .mockImplementation(function (this: HTMLElement) {
          return this.getAttribute('role') === 'grid' ? 650 : 700;
        });
      scrollWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollWidth', 'get')
        .mockImplementation(() => 690);

      let {queryByRole} = render(
        <AttachmentList aria-label="Uploaded files">
          <Attachment aria-label="one.pdf" textValue="one.pdf">
            <Image slot="thumbnail" src="https://example.com/image.png" />
          </Attachment>
          <Attachment aria-label="two.pdf" textValue="two.pdf">
            <Image slot="thumbnail" src="https://example.com/image.png" />
          </Attachment>
        </AttachmentList>
      );

      expect(queryByRole('button', {name: 'Show previous attachments'})).not.toBeInTheDocument();
    });

    it('should disable "previous" at the natural resting start position, even when it is not scrollLeft 0', () => {
      // Browsers can rest scroll-snapped content at a nonzero scrollLeft (e.g. to account for the
      // track's own padding) - the very first read should be treated as "the start", not literal 0.
      offsetWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get')
        .mockImplementation(() => 200);
      clientWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'clientWidth', 'get')
        .mockImplementation(() => 200);
      scrollWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollWidth', 'get')
        .mockImplementation(() => 800);
      let scrollLeftSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollLeft', 'get')
        .mockImplementation(() => 12);

      let {getByRole} = render(
        <AttachmentList aria-label="Uploaded files">
          <Attachment aria-label="one.pdf" textValue="one.pdf">
            <Image slot="thumbnail" src="https://example.com/image.png" />
          </Attachment>
          <Attachment aria-label="two.pdf" textValue="two.pdf">
            <Image slot="thumbnail" src="https://example.com/image.png" />
          </Attachment>
        </AttachmentList>
      );

      expect(getByRole('button', {name: 'Show previous attachments'})).toBeDisabled();
      expect(getByRole('button', {name: 'Show next attachments'})).not.toBeDisabled();

      scrollLeftSpy.mockRestore();
    });

    it('should recalculate carousel mode when the container is resized', () => {
      // ResizeObserver isn't implemented in jsdom, so this exercises the window resize fallback
      // (useResizeObserver observes the parent element and falls back to a 'resize' listener).
      let fits = true;
      offsetWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get')
        .mockImplementation(() => (fits ? 800 : 200));
      scrollWidthSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollWidth', 'get')
        .mockImplementation(() => 700);

      let {queryByRole} = render(
        <AttachmentList aria-label="Uploaded files">
          <Attachment aria-label="one.pdf" textValue="one.pdf">
            <Image slot="thumbnail" src="https://example.com/image.png" />
          </Attachment>
          <Attachment aria-label="two.pdf" textValue="two.pdf">
            <Image slot="thumbnail" src="https://example.com/image.png" />
          </Attachment>
        </AttachmentList>
      );

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
      // Starts at the resting position, then simulate having scrolled in, so "previous" isn't
      // disabled at the start boundary when it's pressed.
      let scrollLeftValue = 0;
      let scrollLeftSpy = jest
        .spyOn(window.HTMLElement.prototype, 'scrollLeft', 'get')
        .mockImplementation(() => scrollLeftValue);
      let scrollBy = jest.fn();
      window.HTMLElement.prototype.scrollBy = scrollBy;

      let {getByRole} = render(
        <Provider locale="ar-AE">
          <AttachmentList aria-label="Uploaded files">
            <Attachment aria-label="one.pdf" textValue="one.pdf">
              <Image slot="thumbnail" src="https://example.com/image.png" />
            </Attachment>
            <Attachment aria-label="two.pdf" textValue="two.pdf">
              <Image slot="thumbnail" src="https://example.com/image.png" />
            </Attachment>
          </AttachmentList>
        </Provider>
      );

      scrollLeftValue = -300;
      fireEvent.scroll(getByRole('grid'));

      await user.click(getByRole('button', {name: 'Show previous attachments'}));
      // RTL's negative-scrollLeft convention means "toward the start" is a positive delta,
      // the opposite of LTR.
      expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({left: expect.any(Number)}));
      expect(scrollBy.mock.calls[0][0].left).toBeGreaterThan(0);

      scrollLeftSpy.mockRestore();
    });
  });
});
