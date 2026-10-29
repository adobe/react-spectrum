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

// These scratch variants change the actual hook source in Vite's module pipeline.
// They never write to the product file or change the TLA+ model.
export const mutations = {
  'cancel-activates': {
    before: 'triggerPressEnd(createEvent(state.target, e), state.pointerType, false);',
    after: 'triggerPressEnd(createEvent(state.target, e), state.pointerType, true);',
    test: 'cancellation safety: pointercancel'
  },
  'duplicate-press': {
    before: 'onPress(event);',
    after: 'onPress(event); onPress(event);',
    test: 'activation uniqueness'
  },
  'unbalanced-end': {
    before: 'state.didFirePressStart = false;',
    after: '/* scratch defect: leave didFirePressStart set */',
    test: 'lifecycle balance'
  },
  'leak-timer': {
    before: 'state.disposables.push(() => clearTimeout(timeout));',
    after: 'state.disposables.push(() => {});',
    test: 'resource cleanup'
  }
};
