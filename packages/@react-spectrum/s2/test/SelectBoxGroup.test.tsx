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

import {describe, expect, it} from 'vitest';
import React from 'react';
import {render} from './utils/render';
import {SelectBox, SelectBoxGroup, Text} from '../src';

describe('SelectBoxGroup', () => {
  it('renders', async () => {
    const screen = await render(
      <SelectBoxGroup aria-label="Select a cloud">
        <SelectBox id="aws" textValue="Amazon Web Services">
          <Text slot="label">Amazon Web Services</Text>
        </SelectBox>
        <SelectBox id="azure" textValue="Microsoft Azure">
          <Text slot="label">Microsoft Azure</Text>
        </SelectBox>
        <SelectBox id="gcp" textValue="Google Cloud Platform">
          <Text slot="label">Google Cloud Platform</Text>
        </SelectBox>
        <SelectBox id="ibm" textValue="IBM Cloud">
          <Text slot="label">IBM Cloud</Text>
        </SelectBox>
      </SelectBoxGroup>
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});
