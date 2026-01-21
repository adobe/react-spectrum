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

import {Button, ButtonGroup, Content, DropZone, FileTrigger, Heading, IllustratedMessage} from '../src';
import CloudUpload from '@react-spectrum/s2/illustrations/gradient/generic1/CloudUpload';
import {describe, expect, it} from 'vitest';
import React from 'react';
import {render} from './utils/render';
import {style} from '../style' with {type: 'macro'};

describe('DropZone', () => {
  it('renders', async () => {
    const screen = await render(
      <DropZone
        styles={style({width: 320, maxWidth: '90%'})}
        getDropOperation={types => (
          ['text/plain', 'image/jpeg', 'image/png', 'image/gif'].some(t => types.has(t))
            ? 'copy'
            : 'cancel'
        )}
        onDrop={async () => {}}>
        <IllustratedMessage>
          <CloudUpload />
          <Heading>Drag and drop your file</Heading>
          <Content>or</Content>
          <ButtonGroup>
            <FileTrigger>
              <Button variant="primary">Select a file</Button>
            </FileTrigger>
          </ButtonGroup>
        </IllustratedMessage>
      </DropZone>
    );
    expect(screen.getByText('Select a file')).toBeInTheDocument();
  });
});
