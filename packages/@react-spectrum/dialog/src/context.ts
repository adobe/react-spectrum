import {DOMProps} from '@react-types/shared';
import React from 'react';

interface DialogContextValue extends DOMProps {
  type: 'modal' | 'popover' | 'tray',
  onClose?: () => void
}

export const DialogContext = React.createContext<DialogContextValue>(null);
