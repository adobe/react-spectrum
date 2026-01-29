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
  Button,
  ButtonGroup,
  Checkbox,
  Content,
  Dialog,
  DialogTrigger,
  Footer,
  Form,
  Heading,
  Image,
  TextField
} from '../src';
import {describe, expect, it, vi} from 'vitest';
import React from 'react';
import {render} from './utils/render';

describe('Dialog', () => {
  it('renders', async () => {
    vi.useFakeTimers();
    const screen = await render(
      <DialogTrigger defaultOpen>
        <Button variant="primary">Open Dialog</Button>
        <Dialog>
          {({close}) => (
            <>
              <Image slot="hero" src="https://via.placeholder.com/400x200" alt="Hero" />
              <Heading slot="title">Subscribe to our newsletter</Heading>
              <Content>
                <p>Enter your information to subscribe to our newsletter and receive updates about new features and announcements.</p>
                <Form>
                  <TextField label="Name" />
                  <TextField label="Email" type="email" />
                </Form>
              </Content>
              <Footer>
                <Checkbox>Don't show this again</Checkbox>
              </Footer>
              <ButtonGroup>
                <Button onPress={close} variant="secondary">Cancel</Button>
                <Button onPress={close} variant="accent">Subscribe</Button>
              </ButtonGroup>
            </>
          )}
        </Dialog>
      </DialogTrigger>
    );
    vi.runAllTimers();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
