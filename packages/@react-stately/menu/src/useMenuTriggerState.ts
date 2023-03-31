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
import {Key, useState} from 'react';
import {MenuTriggerProps} from '@react-types/menu';
import {OverlayTriggerState, useOverlayTriggerState} from '@react-stately/overlays';

export interface MenuTriggerState extends OverlayTriggerState {
  /** Controls which item will be auto focused when the menu opens. */
  readonly focusStrategy: FocusStrategy,

  /** Opens the menu. */
  open(focusStrategy?: FocusStrategy | null): void,

  /** Toggles the menu. */
  toggle(focusStrategy?: FocusStrategy | null): void,
  openKey: Key | null,
  setOpenKey: (key: Key | null) => void,
  openRef: any,
  setOpenRef: (val: any) => void
}

/**
 * Manages state for a menu trigger. Tracks whether the menu is currently open,
 * and controls which item will receive focus when it opens.
 */
export function useMenuTriggerState(props: MenuTriggerProps): MenuTriggerState  {
  let overlayTriggerState = useOverlayTriggerState(props);
  let [focusStrategy, setFocusStrategy] = useState<FocusStrategy>(null);


  let [openKey, setOpenKey] = useState<Key | null>(null);
  let [openRef, setOpenRef] = useState(null);

  let disableClosing = openKey != null;

  return {
    focusStrategy,
    ...overlayTriggerState,
    close() {
      if (!disableClosing) {
        overlayTriggerState.close();
      }
    },
    open(focusStrategy: FocusStrategy = null) {
      setFocusStrategy(focusStrategy);
      overlayTriggerState.open();
    },
    toggle(focusStrategy: FocusStrategy = null) {
      if (overlayTriggerState.isOpen && !disableClosing || !overlayTriggerState.isOpen) {
        setFocusStrategy(focusStrategy);
        overlayTriggerState.toggle();
      }
    },
    openKey,
    setOpenKey,
    openRef,
    setOpenRef
  };
}
