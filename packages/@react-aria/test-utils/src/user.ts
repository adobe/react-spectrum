/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {pointerMap} from './';
import {SelectTester} from './select';
import {TableTester} from './table';
import userEvent from '@testing-library/user-event';

interface UserOpts {
  interactionType?: 'mouse' | 'touch' | 'keyboard'
}


let availablePatterns = {'SelectTester': SelectTester, 'TableTester': TableTester};

export class User {
  user;
  interactionType: UserOpts['interactionType'];
  // select: SelectTester;
  // table: TableTester;

  constructor(opts: UserOpts = {}) {
    let {interactionType} = opts;
    this.user = userEvent.setup({delay: null, pointerMap});
    this.interactionType = interactionType;
    // this.select = new SelectTester({user, interactionType});
    // this.table = new TableTester({user, interactionType});

    // TODO: calling these two will cause user.click to detected as a virtual click
    // resulting in unexcepted behaviors (focus moves to picker's listbox option on open instad of focusing the listbox as awhole)
    // Either rely on the user calling the below when they want to test drag/long press operations OR
    // figure out what userevent interaction that would still be detected as a click/touch properly....
    // installMouseEvent();
    // installPointerEvent();
    // don't mock screen width for now to keep this as a generic as possible
  }


  // TODO: add a setup/cleanup if need be

  // TODO: provide the below so the user can call the stuff that installMouseEvent/installPointerEvent at the specific part of the test where they need it?
  // Have it also return a cleanup function?
  // setupMouseMock() {

  // }

  // setupPointerMock() {

  // }

  // TODO: maybe I should just export the patterns themselves instead of this factory
  // TODO typescript
  createTester(patternName: string) {
    return new (availablePatterns)[patternName]({user: this.user, interactionType: this.interactionType});
  }
}
