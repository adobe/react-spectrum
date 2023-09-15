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

import {DOMProps, FocusStrategy, HoverEvents, PressEvents} from '@react-types/shared';
import {MenuTreeState, MenuTriggerState} from '@react-stately/menu';
import React, {HTMLAttributes, MutableRefObject, RefObject, useContext} from 'react';
import {TreeState} from '@react-stately/tree';

// TODO: debug typescript issue here, not sure why it is complaining about the keydown types now
export interface MenuContextValue extends Omit<HTMLAttributes<HTMLElement>, 'autoFocus' | 'onKeyDown'> {
  onClose?: () => void,
  closeOnSelect?: boolean,
  shouldFocusWrap?: boolean,
  autoFocus?: boolean | FocusStrategy,
  ref?: MutableRefObject<HTMLUListElement>,
  state?: MenuTriggerState,
  menuTreeState?: MenuTreeState,
  onKeyDown?: (e: KeyboardEvent) => void
}

export const MenuContext = React.createContext<MenuContextValue>({});

export function useMenuContext(): MenuContextValue {
  return useContext(MenuContext);
}

export interface MenuDialogContextValue extends DOMProps, Pick<PressEvents, 'onPressStart' | 'onPress'>, Pick<HoverEvents, 'onHoverChange'> {
  isUnavailable?: boolean,
  triggerRef?: MutableRefObject<HTMLLIElement>,
  'aria-expanded'?: boolean | 'true' | 'false',
  'aria-controls'?: string,
  'aria-haspopup'?: 'dialog' | 'menu',
  onKeyDown?: (e: KeyboardEvent) => void
}

export const MenuDialogContext = React.createContext<MenuDialogContextValue | undefined>(undefined);

export function useMenuDialogContext(): MenuDialogContextValue {
  return useContext(MenuDialogContext);
}

export interface MenuStateContextValue<T> {
  state?: TreeState<T>,
  container?: RefObject<HTMLElement>,
  menu?: RefObject<HTMLUListElement>,
  menuTreeState?: MenuTreeState,
  submenu?: RefObject<HTMLUListElement>
}

export const MenuStateContext = React.createContext<MenuStateContextValue<any>>(undefined);

export function useMenuStateContext<T>(): MenuStateContextValue<T> {
  return useContext(MenuStateContext);
}
