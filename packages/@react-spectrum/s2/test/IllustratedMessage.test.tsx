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

import {Button, ButtonGroup, Content, Heading, IllustratedMessage} from '../src';
import {describe, expect, it} from 'vitest';
import Image from '@react-spectrum/s2/illustrations/gradient/generic1/Image';
import React from 'react';
import {render} from './utils/render';

describe('IllustratedMessage', () => {
  it('renders', async () => {
    const screen = await render(
      <IllustratedMessage>
        <Image />
        <Heading>Create your first asset.</Heading>
        <Content>Get started by uploading or importing some assets.</Content>
        <ButtonGroup>
          <Button variant="secondary">Import</Button>
          <Button variant="accent">Upload</Button>
        </ButtonGroup>
      </IllustratedMessage>
    );
    expect(screen.container.firstChild).toBeInTheDocument();
  });
});
