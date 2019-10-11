import {DOMProps} from '@react-types/shared';
import React from 'react';

interface TooltipContextValue extends DOMProps {
  type: 'left' | 'right' | 'top' | 'bottom',
  onClose?: () => void
}

export const TooltipContext = React.createContext<TooltipContextValue>(null);
