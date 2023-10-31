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

import {FocusStrategy} from '@react-types/shared';
import {Key, useCallback, useMemo, useState} from 'react';
import type {MenuTriggerState} from './useMenuTriggerState';
import type {OverlayTriggerState} from '@react-stately/overlays';

export interface SubmenuTriggerProps {
  /** Key of the trigger item. */
  triggerKey: Key
}

export interface SubmenuTriggerState extends OverlayTriggerState {
  /** Whether the submenu is currently open. */
  isOpen: boolean,
  /** Controls which item will be auto focused when the submenu opens. */
  focusStrategy: FocusStrategy | null,
  /** Opens the submenu. */
  open: (focusStrategy?: FocusStrategy | null) => void,
  /** Closes the submenu. */
  close: () => void,
  /** Closes all menus and submenus in the menu tree. */
  closeAll: () => void,
  /** The level of the submenu. */
  level: number,
  /** Toggles the submenu. */
  toggle: (focusStrategy?: FocusStrategy | null) => void,
  /** @private */
  setOpen: () => void
}

/**
 * Manages state for a submenu trigger. Tracks whether the submenu is currently open, the level of the submenu, and
 * controls which item will receive focus when it opens.
 */
export function UNSTABLE_useSubmenuTriggerState(props: SubmenuTriggerProps, state: MenuTriggerState): SubmenuTriggerState  {
  let {triggerKey} = props;
  let {UNSTABLE_expandedKeysStack, UNSTABLE_openSubmenu, UNSTABLE_closeSubmenu, close: closeAll} = state;
  let [level] = useState(UNSTABLE_expandedKeysStack?.length + 1);
  let isOpen = useMemo(() => UNSTABLE_expandedKeysStack[level - 1] === triggerKey, [UNSTABLE_expandedKeysStack, triggerKey, level]);
  let [focusStrategy, setFocusStrategy] = useState<FocusStrategy>(null);

  let open = useCallback((focusStrategy: FocusStrategy = null) => {
    setFocusStrategy(focusStrategy);
    UNSTABLE_openSubmenu(triggerKey, level);
  }, [UNSTABLE_openSubmenu, level, triggerKey]);

  let close = useCallback(() => {
    setFocusStrategy(null);
    UNSTABLE_closeSubmenu(triggerKey, level);
  }, [UNSTABLE_closeSubmenu, level, triggerKey]);

  let toggle = useCallback((focusStrategy: FocusStrategy = null) => {
    setFocusStrategy(focusStrategy);
    if (isOpen) {
      close();
    } else {
      open(focusStrategy);
    }
  }, [close, open, isOpen]);

  return useMemo(() => ({
    focusStrategy,
    isOpen,
    open,
    close,
    closeAll,
    level,
    // TODO: Placeholders that aren't used but give us parity with OverlayTriggerState so we can use this in Popover. Refactor if we update Popover via
    // https://github.com/adobe/react-spectrum/pull/4976#discussion_r1336472863
    setOpen: () => {},
    toggle
  }), [isOpen, open, close, closeAll, focusStrategy, toggle, level]);
}
