import {DOMProps, SelectionMode} from '@react-types/shared';
import {FocusStrategy} from '@react-aria/menu-trigger';
import React from 'react';

export interface MenuContextValue extends DOMProps {
  onClose?: () => void,
  selectionMode?: SelectionMode,
  setOpen?: (boolean) => void,
  focusStrategy?: FocusStrategy,
  setFocusStrategy?: (value: FocusStrategy) => void
}

export const MenuContext = React.createContext<MenuContextValue>({});
