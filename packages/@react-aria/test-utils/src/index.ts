/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

export {triggerLongPress} from './events';
export {installMouseEvent, installPointerEvent} from './testSetup';
export {pointerMap} from './userEventMaps';
export {User} from './user';
// TODO: had to export these for the docs, but not sure why I didn't have to do
// so for the v3 docs?
export {ComboBoxTester} from './combobox';
export {GridListTester} from './gridlist';
export {ListBoxTester} from './listbox';
export {MenuTester} from './menu';
export {SelectTester} from './select';
export {TableTester} from './table';
export {TabsTester} from './tabs';
export {TreeTester} from './tree';

export type {UserOpts} from './types';
