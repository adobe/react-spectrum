import React, {HTMLAttributes} from 'react';

export interface DialogContextValue extends HTMLAttributes<HTMLElement> {
  type: 'modal' | 'popover' | 'tray',
  onClose?: () => void
}

export const DialogContext = React.createContext<DialogContextValue>(null);
