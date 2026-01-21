/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Checkbox, Content, Text} from '../src';
import {CoachMark, CoachMarkTrigger} from '../src/CoachMark';
import {describe, expect, it, vi} from 'vitest';
import React from 'react';
import {render} from './utils/render';

describe('CoachMark', () => {
  it('renders', async () => {
    vi.useFakeTimers();
    Element.prototype.animate = vi.fn().mockImplementation(() => ({finished: Promise.resolve()}));
    const screen = await render(
      <CoachMarkTrigger isOpen>
        <Checkbox>Sync with CC</Checkbox>
        <CoachMark placement="right top">
          <Content>
            <Text slot="title">Hello</Text>
            <Text slot="description">This is the description</Text>
          </Content>
        </CoachMark>
      </CoachMarkTrigger>
    );
    vi.runAllTimers();
    expect(screen.container.firstChild).toBeInTheDocument();
    vi.useRealTimers();
  });
});
