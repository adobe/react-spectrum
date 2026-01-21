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

import {
  ActionButton, 
  Button,
  DialogTrigger,
  Form,
  Popover,
  Switch,
  TextField
} from '../src';
import {describe, expect, it, vi} from 'vitest';
import Feedback from '@react-spectrum/s2/icons/Feedback';
import React from 'react';
import {render} from './utils';

describe('Popover', () => {
  it('renders', async () => {
    vi.useFakeTimers();
    const screen = await render(
      <DialogTrigger defaultOpen>
        <ActionButton aria-label="Feedback">
          <Feedback />
        </ActionButton>
        <Popover>
          <div style={{padding: 12}}>
            <p style={{marginTop: 0}}>How are we doing? Share your feedback here.</p>
            <Form>
              <TextField label="Subject" placeholder="Enter a summary" />
              <TextField label="Description" isRequired placeholder="Enter your feedback" />
              <Switch>Adobe can contact me for further questions concerning this feedback</Switch>
              <Button style={{marginLeft: 'auto'}}>Submit</Button>
            </Form>
          </div>
        </Popover>
      </DialogTrigger>
    );
    vi.runAllTimers();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
