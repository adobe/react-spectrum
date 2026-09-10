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

import {Attachment, AttachmentList, AttachmentPreview} from '@react-spectrum/ai';
import {Image} from '@react-spectrum/s2/Image';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';

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

  it('should switch to a carousel once attachments overflow the container width', () => {
    let offsetWidthSpy = jest
      .spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get')
      .mockImplementation(() => 200);
    let scrollWidthSpy = jest
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

    offsetWidthSpy.mockRestore();
    scrollWidthSpy.mockRestore();
  });

  it('should automatically show a mime-type badge on the large thumbnail variant', () => {
    let {getByText} = render(
      <AttachmentList aria-label="Uploaded files">
        <Attachment aria-label="Demo file.pdf" size="L">
          <AttachmentPreview
            mimeType="application/pdf"
            slot="thumbnail"
            src="https://example.com/image.png"
          />
        </Attachment>
      </AttachmentList>
    );
    expect(getByText('PDF')).toBeInTheDocument();
  });

  it('should not show a badge for other sizes or when no thumbnail image is provided', () => {
    let {queryByText, rerender} = render(
      <AttachmentList aria-label="Uploaded files">
        <Attachment aria-label="Demo file.pdf" size="M">
          <AttachmentPreview
            mimeType="application/pdf"
            slot="thumbnail"
            src="https://example.com/image.png"
          />
        </Attachment>
      </AttachmentList>
    );
    expect(queryByText('PDF')).not.toBeInTheDocument();

    rerender(
      <AttachmentList aria-label="Uploaded files">
        <Attachment aria-label="report.pdf" size="L">
          <AttachmentPreview mimeType="application/pdf" />
        </Attachment>
      </AttachmentList>
    );
    expect(queryByText('PDF')).not.toBeInTheDocument();
  });
});
