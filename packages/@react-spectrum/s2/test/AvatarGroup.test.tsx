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

import {Avatar, AvatarGroup} from '../src';
import {describe, expect, it} from 'vitest';
import React from 'react';
import {render} from './utils/render';

describe('AvatarGroup', () => {
  it('renders', async () => {
    const screen = await render(
      <AvatarGroup aria-label="Team members">
        <Avatar
          alt="Abraham Baker"
          src="https://www.untitledui.com/images/avatars/abraham-baker" />
        <Avatar
          alt="Adriana Sullivan"
          src="https://www.untitledui.com/images/avatars/adriana-sullivan" />
        <Avatar
          alt="Jonathan Kelly"
          src="https://www.untitledui.com/images/avatars/jonathan-kelly" />
        <Avatar
          alt="Zara Bush"
          src="https://www.untitledui.com/images/avatars/zara-bush" />
      </AvatarGroup>
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
  });
});
