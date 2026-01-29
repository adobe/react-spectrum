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

import {Button, ButtonGroup} from '../src';
import {describe, expect, it} from 'vitest';
import React from 'react';
import {render} from './utils/render';

describe('ButtonGroup', () => {
  it('renders', async () => {
    const screen = await render(
      <ButtonGroup>
        <Button variant="primary">Rate Now</Button>
        <Button variant="secondary">No, thanks</Button>
        <Button variant="secondary">Remind me later</Button>
      </ButtonGroup>
    );
    const buttons = screen.container.querySelectorAll('button');
    expect(buttons.length).toBe(3);
  });
});
