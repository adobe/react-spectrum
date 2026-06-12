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

import {Button} from '../src/Button';
import {ButtonGroup} from '../src/ButtonGroup';
import {describe, expect, it} from 'vitest';
import React from 'react';
import {render} from './utils/render';

describe('ButtonGroup', () => {
  it('stacks vertically when the container shrinks below the width of buttons with no-space labels', async () => {
    let {container} = await render(
      <div style={{width: '500px'}} data-testid="wrapper">
        <ButtonGroup data-testid="button-group">
          <Button variant="primary">nospace</Button>
          <Button variant="secondary">nospace</Button>
          <Button variant="secondary">nospace</Button>
        </ButtonGroup>
      </div>
    );

    let wrapper = container.querySelector('[data-testid="wrapper"]') as HTMLElement;
    let buttonGroup = container.querySelector('[data-testid="button-group"]') as HTMLElement;

    // Initially wide — buttons should be laid out horizontally
    expect(getComputedStyle(buttonGroup).flexDirection).toBe('row');

    // Shrink the container below the combined button widths to trigger overflow detection
    wrapper.style.width = '50px';

    // Wait for ResizeObserver and React re-render to settle
    await expect.poll(() => getComputedStyle(buttonGroup).flexDirection).toBe('column');

    // Restore the container width — should return to horizontal
    wrapper.style.width = '500px';
    await expect.poll(() => getComputedStyle(buttonGroup).flexDirection).toBe('row');
  });
});
