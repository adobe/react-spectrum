import {DOMProps} from '@react-types/shared';
import React from 'react';
import {SelectionMode} from '@react-types/shared';

interface MenuContextValue extends DOMProps {
  onClose?: () => void,
  onSelect?: (...args) => void,
  selectionMode?: SelectionMode
}

export const MenuContext = React.createContext<MenuContextValue>(null);
