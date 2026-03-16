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

import {CheckboxGroupTester} from './checkboxgroup';
import {
  CheckboxGroupTesterOpts,
  ComboBoxTesterOpts,
  DialogTesterOpts,
  GridListTesterOpts,
  ListBoxTesterOpts,
  MenuTesterOpts,
  RadioGroupTesterOpts,
  SelectTesterOpts,
  TableTesterOpts,
  TabsTesterOpts,
  TreeTesterOpts,
  UserOpts
} from './types';
import {ComboBoxTester} from './combobox';
import {DialogTester} from './dialog';
import {GridListTester} from './gridlist';
import {ListBoxTester} from './listbox';
import {MenuTester} from './menu';
import {pointerMap} from './';
import {RadioGroupTester} from './radiogroup';
import {SelectTester} from './select';
import {TableTester} from './table';
import {TabsTester} from './tabs';
import {TreeTester} from './tree';
import userEvent from '@testing-library/user-event';

let keyToUtil: {
  'CheckboxGroup': typeof CheckboxGroupTester,
  'ComboBox': typeof ComboBoxTester,
  'Dialog': typeof DialogTester,
  'GridList': typeof GridListTester,
  'ListBox': typeof ListBoxTester,
  'Menu': typeof MenuTester,
  'RadioGroup': typeof RadioGroupTester,
  'Select': typeof SelectTester,
  'Table': typeof TableTester,
  'Tabs': typeof TabsTester,
  'Tree': typeof TreeTester
} = {
  'CheckboxGroup': CheckboxGroupTester,
  'ComboBox': ComboBoxTester,
  'Dialog': DialogTester,
  'GridList': GridListTester,
  'ListBox': ListBoxTester,
  'Menu': MenuTester,
  'RadioGroup': RadioGroupTester,
  'Select': SelectTester,
  'Table': TableTester,
  'Tabs': TabsTester,
  'Tree': TreeTester
} as const;
export type PatternNames = keyof typeof keyToUtil;

// Conditional type: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html
type Tester<T> =
  T extends 'CheckboxGroup' ? CheckboxGroupTester :
  T extends 'ComboBox' ? ComboBoxTester :
  T extends 'Dialog' ? DialogTester :
  T extends 'GridList' ? GridListTester :
  T extends 'ListBox' ? ListBoxTester :
  T extends 'Menu' ? MenuTester :
  T extends 'RadioGroup' ? RadioGroupTester :
  T extends 'Select' ? SelectTester :
  T extends 'Table' ? TableTester :
  T extends 'Tabs' ? TabsTester :
  T extends 'Tree' ? TreeTester :
  never;

type TesterOpts<T> =
  T extends 'CheckboxGroup' ? CheckboxGroupTesterOpts :
  T extends 'ComboBox' ? ComboBoxTesterOpts :
  T extends 'Dialog' ? DialogTesterOpts :
  T extends 'GridList' ? GridListTesterOpts :
  T extends 'ListBox' ? ListBoxTesterOpts :
  T extends 'Menu' ? MenuTesterOpts :
  T extends 'RadioGroup' ? RadioGroupTesterOpts :
  T extends 'Select' ? SelectTesterOpts :
  T extends 'Table' ? TableTesterOpts :
  T extends 'Tabs' ? TabsTesterOpts :
  T extends 'Tree' ? TreeTesterOpts :
  never;

let defaultAdvanceTimer = (waitTime: number | undefined) => new Promise((resolve) => setTimeout(resolve, waitTime));

export class User {
  private user;
  /**
   * The interaction type (mouse, touch, keyboard) that the test util user will use when interacting with a component. This can be overridden
   * at the aria pattern util level if needed.
   * @default mouse
   */
  interactionType: UserOpts['interactionType'];
  /**
   * A function used by the test utils to advance timers during interactions. Required for certain aria patterns (e.g. table).
   */
  advanceTimer: UserOpts['advanceTimer'];

  constructor(opts: UserOpts = {}) {
    let {interactionType, advanceTimer} = opts;
    this.user = userEvent.setup({delay: null, pointerMap});
    this.interactionType = interactionType;
    this.advanceTimer = advanceTimer || defaultAdvanceTimer;
  }

  /**
   * Creates an aria pattern tester, inheriting the options provided to the original user.
   */
  createTester<T extends PatternNames>(patternName: T, opts: TesterOpts<T>): Tester<T> {
    return new (keyToUtil)[patternName]({interactionType: this.interactionType, advanceTimer: this.advanceTimer, ...opts, user: this.user}) as Tester<T>;
  }
}
