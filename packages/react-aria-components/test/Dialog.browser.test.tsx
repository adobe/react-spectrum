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
import {Dialog, DialogTrigger} from '../src/Dialog';
import {expect, it} from 'vitest';
import {Heading} from '../src/Heading';
import {Modal} from '../src/Modal';
import React from 'react';
import {render} from 'vitest-browser-react';
import {User} from '@react-aria/test-utils';

function DialogExample() {
  return (
    <DialogTrigger>
      <Button>Open dialog</Button>
      <Modal>
        <Dialog>
          <Heading slot="title">Hello</Heading>
          <Button slot="close" autoFocus>Close</Button>
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}

it.each`
  interactionType
  ${'mouse'}
  ${'keyboard'}
`('opens via $interactionType and closes', async ({interactionType}) => {
  let testUtilUser = new User();
  let {container} = await render(<DialogExample />);

  let tester = testUtilUser.createTester('Dialog', {root: container.querySelector('button') as HTMLElement, interactionType});

  await tester.open();
  expect(tester.dialog()).not.toBeNull();
  expect(tester.dialog()!.contains(document.activeElement)).toBe(true);

  await tester.close();
  expect(tester.dialog()).toBeNull();
});
