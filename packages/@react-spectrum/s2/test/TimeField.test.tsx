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
import {TimeField} from '../src';

describe('TimeField', () => {
  it('renders', async () => {
    const screen = await render(<TimeField label="Event time" />);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });
});
