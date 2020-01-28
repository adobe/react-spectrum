import {DOMProps, SelectionMode} from '@react-types/shared';
import {FocusStrategy} from '@react-types/menu';
import React from 'react';

export interface MenuContextValue extends DOMProps {
  setOpen?: (value: boolean) => void,
  focusStrategy?: FocusStrategy,
  setFocusStrategy?: (value: FocusStrategy) => void,
  selectionMode?: SelectionMode
}

export const MenuContext = React.createContext<MenuContextValue>({});
