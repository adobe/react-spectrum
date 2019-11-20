import {DOMProps} from '@react-types/shared';
import React from 'react';

interface MenuContextValue extends DOMProps {
  onClose?: () => void,
  onSelect?: (...args) => void
}

export const MenuContext = React.createContext<MenuContextValue>(null);
