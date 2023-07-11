/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button} from '@react-spectrum/button';
// import {ClipboardEvent, DataTransfer, DataTransferItem, DragEvent} from '@react-aria/dnd/test/mocks';
import {Content} from '@react-spectrum/view';
// import {Draggable} from '@react-aria/dnd/test/examples';
import {DropZone} from '../';
import {FileTrigger} from 'react-aria-components';
import {Heading} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import React from 'react';
import {render} from '@react-spectrum/test-utils';
// import userEvent from '@testing-library/user-event';

describe('DropZone', () => {
  it('should render a dropzone', () => {
    let {getByTestId} = render(
      <DropZone data-testid="foo">
        <IllustratedMessage>
          <Heading>No files</Heading>
          <Content>
            <FileTrigger>
              <Button variant="primary">Upload Files</Button>
            </FileTrigger>
          </Content>
        </IllustratedMessage>
      </DropZone>
    );
    let dropzone = getByTestId('foo');
    expect(dropzone).toHaveAttribute('class', 'spectrum-Dropzone');
  });
});
