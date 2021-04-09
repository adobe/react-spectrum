/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {FocusStrategy} from '@react-types/shared';
import {MenuTriggerProps} from '@react-types/menu';
import {OverlayTriggerState, useOverlayTriggerState} from '@react-stately/overlays';
import {useState} from 'react';

export interface MenuTriggerState extends OverlayTriggerState {
  /** Controls which item will be auto focused when the menu opens. */
  readonly focusStrategy: FocusStrategy,

  /** Opens the menu. */
  open(focusStrategy?: FocusStrategy | null): void,

  /** Toggles the menu. */
  toggle(focusStrategy?: FocusStrategy | null): void
}

/**
 * Manages state for a menu trigger. Tracks whether the menu is currently open,
 * and controls which item will receive focus when it opens.
 */
export function useMenuTriggerState(props: MenuTriggerProps): MenuTriggerState  {
  let overlayTriggerState = useOverlayTriggerState(props);
  let [focusStrategy, setFocusStrategy] = useState<FocusStrategy>(null);

  return {
    focusStrategy,
    ...overlayTriggerState,
    open(focusStrategy: FocusStrategy = null) {
      setFocusStrategy(focusStrategy);
      overlayTriggerState.open();
    },
    toggle(focusStrategy: FocusStrategy = null) {
      setFocusStrategy(focusStrategy);
      overlayTriggerState.toggle();
    }
  };
}
