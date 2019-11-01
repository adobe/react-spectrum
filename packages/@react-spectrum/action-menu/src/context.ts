import {DOMProps} from '@react-types/shared';
import React from 'react';

interface MenuContextValue extends DOMProps {
  // type: 'modal' | 'popover' | 'tray',
  // onClose?: () => void
  //TODO Add types here
}

export const MenuContext = React.createContext<MenuContextValue>(null);
