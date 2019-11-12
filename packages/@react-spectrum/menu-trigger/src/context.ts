import {DOMProps} from '@react-types/shared';
import React from 'react';

interface MenuContextValue extends DOMProps {
  onClose?: () => void
}

export const MenuContext = React.createContext<MenuContextValue>(null);
