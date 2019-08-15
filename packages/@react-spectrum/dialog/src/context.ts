import React from 'react';

interface DialogContextValue {
  type: 'modal' | 'popover' | 'tray',
  onClose?: () => void
}

export const DialogContext = React.createContext<DialogContextValue>(null);
