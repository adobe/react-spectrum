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

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Button} from '../src/Button';
import {DropZone as RACDropZone} from 'react-aria-components/DropZone';
import React, {useState} from 'react';
import {Skeleton} from '../src/Skeleton';
import {Tab, TabList, TabPanel, Tabs} from '../src/Tabs';
import {Text} from '../src/Content';
import userEvent from '@testing-library/user-event';

describe('Tabs', () => {
  let user;
  beforeAll(() => {
    jest.useFakeTimers();
    user = userEvent.setup({delay: null, pointerMap});
    Element.prototype.getAnimations = jest.fn().mockImplementation(() => []);
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => jest.runAllTimers());
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should not infinite-loop when inside DropZone with a controlled Tabs + Skeleton + Text', async () => {
    function Repro() {
      const [tab, setTab] = useState<string>('a');
      return (
        <RACDropZone data-testid="dropzone" aria-label="DropZone">
          <Button onPress={() => {}}>Sign in</Button>
          <Tabs aria-label="x" selectedKey={tab} onSelectionChange={k => setTab(k as string)}>
            <TabList>
              <Tab id="a">A</Tab>
            </TabList>
            <TabPanel id="a">
              <Skeleton isLoading>
                <Text>x</Text>
              </Skeleton>
            </TabPanel>
          </Tabs>
        </RACDropZone>
      );
    }

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const {getByTestId} = render(<Repro />);

    await act(async () => {
      await user.hover(getByTestId('dropzone'));
    });

    const updateDepthError = errorSpy.mock.calls.find(call =>
      call.some(arg => String(arg).includes('Maximum update depth'))
    );
    expect(updateDepthError).toBeUndefined();
    errorSpy.mockRestore();
  });
});
