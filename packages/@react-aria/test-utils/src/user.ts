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

import {ComboBoxOptions, ComboBoxTester} from './combobox';
import {GridListOptions, GridListTester} from './gridlist';
import {MenuOptions, MenuTester} from './menu';
import {pointerMap} from './';
import {SelectOptions, SelectTester} from './select';
import {TableOptions, TableTester} from './table';
import userEvent from '@testing-library/user-event';

// https://github.com/testing-library/dom-testing-library/issues/939#issuecomment-830771708 is an interesting way of allowing users to configure the timers
// curent way is like https://testing-library.com/docs/user-event/options/#advancetimers,
export interface UserOpts {
  interactionType?: 'mouse' | 'touch' | 'keyboard',
  // If using fake timers user should provide something like (time) => jest.advanceTimersByTime(time))}
  // A real timer user would pass async () => await new Promise((resolve) => setTimeout(resolve, waitTime))
  // Time is in ms.
  advanceTimer?: (time?: number) => void | Promise<unknown>
}

export interface BaseTesterOpts {
  // The base element for the given tester (e.g. the table, menu trigger, etc)
  root: HTMLElement
}

let keyToUtil = {'Select': SelectTester, 'Table': TableTester, 'Menu': MenuTester, 'ComboBox': ComboBoxTester, 'GridList': GridListTester} as const;
export type PatternNames = keyof typeof keyToUtil;

// Conditional type: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html
type ObjectType<T> =
    T extends 'Select' ? SelectTester :
    T extends 'Table' ? TableTester :
    T extends 'Menu' ? MenuTester :
    T extends 'ComboBox' ? ComboBoxTester :
    T extends 'GridList' ? GridListTester :
    never;

type ObjectOptionsTypes<T> =
  T extends 'Select' ? SelectOptions :
  T extends 'Table' ? TableOptions :
  T extends 'Menu' ? MenuOptions :
  T extends 'ComboBox' ? ComboBoxOptions :
  T extends 'GridList' ? GridListOptions :
  never;

let defaultAdvanceTimer = async (waitTime: number | undefined) => await new Promise((resolve) => setTimeout(resolve, waitTime));

export class User {
  user;
  interactionType: UserOpts['interactionType'];
  advanceTimer: UserOpts['advanceTimer'];

  constructor(opts: UserOpts = {}) {
    let {interactionType, advanceTimer} = opts;
    this.user = userEvent.setup({delay: null, pointerMap});
    this.interactionType = interactionType;
    this.advanceTimer = advanceTimer || defaultAdvanceTimer;
  }

  createTester<T extends PatternNames>(patternName: T, opts: ObjectOptionsTypes<T>): ObjectType<T> {
    return new (keyToUtil)[patternName]({...opts, user: this.user, interactionType: this.interactionType, advanceTimer: this.advanceTimer}) as ObjectType<T>;
  }
}
