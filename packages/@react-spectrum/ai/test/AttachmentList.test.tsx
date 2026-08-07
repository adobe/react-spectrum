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
});
