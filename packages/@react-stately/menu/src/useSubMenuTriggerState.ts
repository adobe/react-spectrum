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
import type {MenuTreeState} from './useMenuState';
import type {OverlayTriggerState} from '@react-stately/overlays';
import type {TreeState} from '@react-stately/tree';

export interface SubMenuTriggerProps {
  /** Key of the trigger item. */
  triggerKey: Key
}

export interface SubMenuTriggerState extends OverlayTriggerState {
  // TODO descriptions
  isOpen: boolean,
  focusStrategy: FocusStrategy | null,
  open: (focusStrategy?: FocusStrategy | null) => void,
  close: () => void,
  closeAll: () => void,
  toggle: (focusStrategy?: FocusStrategy | null) => void,
  setOpen: () => void
}

// TODO: ideally onClose would be passed in from the Trigger level rather than the menu level so that we could call it
// TODO descriptions and naming
// TODO: needs UNSTABLE?
// TODO: I'm passing in the parent menu's TreeState now so that we can set expanded keys so a menu can know if it has any sub menus open.
// The alternative to using expandedKeys would involve making each menu track which "level" it belongs to and have it the look up that index in
// the MenuTreeState's expandedKeyStack and see if its collection has a matching key. This feels arguably more correct but would then involve
// having useMenu accept MenuTreeState instead which might not be the worst thing tbh. Open to discussion
export function useSubMenuTriggerState<T>(props: SubMenuTriggerProps, state: MenuTreeState & TreeState<T>): SubMenuTriggerState  {
  // Need some form of isOpen and close for usePopover. Will also need closeAll for onClose for menu items, would be kinda weird
  // to pass in both menuTreeState and the state returned by useSubMenuTriggerState.
  // WOuld it be helpful returning level as well?
  let {triggerKey} = props;
  let {expandedKeysStack, openSubMenu, closeSubMenu, closeAll, setExpandedKeys, expandedKeys, toggleKey} = state;
  let [level] = useState(expandedKeysStack?.length + 1);
  let isOpen = useMemo(() => expandedKeysStack[level - 1] === triggerKey, [expandedKeysStack, triggerKey, level]);
  let [focusStrategy, setFocusStrategy] = useState<FocusStrategy>(null);

  let open = useCallback((focusStrategy: FocusStrategy = null) => {
    setFocusStrategy(focusStrategy);
    setExpandedKeys(new Set([triggerKey]));
    openSubMenu(triggerKey, level);
  }, [openSubMenu, level, triggerKey, setExpandedKeys]);

  let close = useCallback(() => {
    setFocusStrategy(null);
    if (expandedKeys.has(triggerKey)) {
      toggleKey(triggerKey);
    }
    closeSubMenu(triggerKey, level);
  }, [closeSubMenu, level, triggerKey, toggleKey, expandedKeys]);

  let toggle = useCallback((focusStrategy: FocusStrategy = null) => {
    setFocusStrategy(focusStrategy);
    if (isOpen) {
      close();
    } else {
      open(focusStrategy);
    }
  }, [close, open, isOpen]);

  // Memo is a bit useless here since menuTreeState always returns a new instance
  return useMemo(() => ({
    focusStrategy,
    isOpen,
    open,
    close,
    closeAll,
    // TODO: add setOpen and toggle for type parity with useOverlayTriggerState type that Tray and Popover expect. Perhaps call useOverlayTriggerState in
    // this hook and just make it controlled? Then spread?
    setOpen: () => {},
    toggle
  }), [isOpen, open, close, closeAll, focusStrategy, toggle]);
}
