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

import {ComboBoxTester} from './combobox';
import {GridListTester} from './gridlist';
import {MenuTester} from './menu';
import {pointerMap} from './';
import {SelectTester} from './select';
import {TableTester} from './table';
import userEvent from '@testing-library/user-event';

// https://github.com/testing-library/dom-testing-library/issues/939#issuecomment-830771708 is an interesting way of allowing users to configure the timers
// curent way is like https://testing-library.com/docs/user-event/options/#advancetimers,
export interface UserOpts {
  interactionType?: 'mouse' | 'touch' | 'keyboard',
  // If using fake timers user should provide something like (time) => jest.advanceTimersByTime(time))}
  // A real timer user would pass async () => await new Promise((resolve) => setTimeout(resolve, waitTime))
  // Time is in ms.
  advanceTimer?: (time?: number) => Promise<unknown>
}

let keyToUtil = {'SelectTester': SelectTester, 'TableTester': TableTester, 'MenuTester': MenuTester, 'ComboBoxTester': ComboBoxTester, 'GridListTester': GridListTester} as const;
export type PatternNames = keyof typeof keyToUtil;
// TODO: ideally we'd be able to just use Testers below but not sure how to make typescript properly understand the return type
// type Testers<T extends PatternNames> = typeof keyToUtil[T];
// type Testers = typeof keyToUtil[PatternNames];

// TODO: the below works and returns the proper type in the test but the return below complains...
// Also its a bit gross how I have to define each condition for this conditional type
type ObjectType<T> =
    T extends 'SelectTester' ? SelectTester :
    T extends 'TableTester' ? TableTester :
    T extends 'MenuTester' ? MenuTester :
    T extends 'ComboBoxTester' ? ComboBoxTester :
    T extends 'GridListTester' ? GridListTester :
    never;

let defaultAdvanceTimer = async (waitTime: number) => await new Promise((resolve) => setTimeout(resolve, waitTime));

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

  createTester<T extends PatternNames>(patternName: T): ObjectType<T> {
  // // createTester<T extends PatternNames>(patternName: T): Testers<T> {
  // createTester<T extends PatternNames>(patternName: T): typeof keyToUtil[T] {
    return new (keyToUtil)[patternName]({user: this.user, interactionType: this.interactionType, advanceTimer: this.advanceTimer}) as ObjectType<T>;
  }
}
