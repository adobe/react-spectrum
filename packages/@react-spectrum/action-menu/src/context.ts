import {DOMProps} from '@react-types/shared';
import React from 'react';

interface MenuContextValue extends DOMProps {
  onSelect?: (...args) => void
}

export const MenuContext = React.createContext<MenuContextValue>(null);
