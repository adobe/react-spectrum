import {DOMProps, SelectionMode} from '@react-types/shared';
import {FocusStrategy} from '@react-types/menu';
import React from 'react';

export interface MenuContextValue extends DOMProps {
  onClose?: () => void,
  focusStrategy?: FocusStrategy,
  setFocusStrategy?: (value: FocusStrategy) => void,
  selectionMode?: SelectionMode
}

export const MenuContext = React.createContext<MenuContextValue>({});
