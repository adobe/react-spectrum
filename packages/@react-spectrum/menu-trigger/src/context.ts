import {DOMProps, SelectionMode} from '@react-types/shared';
import React from 'react';

interface MenuContextValue extends DOMProps {
  onClose?: () => void,
  selectionMode?: SelectionMode,
  setOpen?: (boolean) => void
}

export const MenuContext = React.createContext<MenuContextValue>(null);
