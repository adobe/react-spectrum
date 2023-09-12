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

import {Key, useCallback, useMemo, useState} from 'react';
import type {MenuTriggerState} from './useMenuTriggerState';

export interface MenuTreeState {
  // TODO descriptions
  expandedKeysStack: Key[],
  closeAll: () => void,
  openSubMenu: (triggerKey: Key, level: number) => void,
  closeSubMenu: (triggerKey: Key, level: number) => void
}

// TODO descriptions and naming. useMenuState or useMenuTreeState?
// TODO: needs UNSTABLE?
// Added props here so we can handle adding props in the future if need be, otherwise it would be a breaking change
export function useMenuState(props: {}, state: MenuTriggerState): MenuTreeState  {
  // TODO: Didn't really make sense to include the root menu key in the stack since its open state is goverened by MenuTriggerState unlike the submenus
  // We could have useMenuState track the root menu's open state as well or have Popover/Tray take closeAll instead of menuTriggerState.close()?
  // Or even merge the two states together?

  // TODO: Another problem is that clicking outside of the all the menu's doesn't wipe the expandedKeysStack. Perhaps handle this in useSubMenutrigger
  // and wipe it if the submenutrigger has unmounted? Or maybe it is reasonable to have the user pass () => closeAll() to useOverlay like it is done in the aria example that we have

  let [expandedKeysStack, setExpandedKeysStack] = useState<string[]>([]);
  let closeAll = useCallback(() => {
    setExpandedKeysStack([]);
    state.close();
  }, [state]);

  let openSubMenu = useCallback((triggerKey, level) => {
    setExpandedKeysStack(oldStack => [...oldStack.slice(0, level), triggerKey]);
  }, []);

  let closeSubMenu = useCallback((triggerKey, level) => {
    setExpandedKeysStack(oldStack => {
      let key = oldStack[level - 1];
      if (key === triggerKey) {
        return oldStack.slice(0, level - 1);
      } else {
        return oldStack;
      }
    });
  }, []);

  // TODO: Memo is a bit useless here since menuTriggerState always returns a new instance causing closeAll to return one as well
  return useMemo(() => ({
    expandedKeysStack,
    closeAll,
    openSubMenu,
    closeSubMenu
  }), [closeAll, openSubMenu, closeSubMenu, expandedKeysStack]);
}
