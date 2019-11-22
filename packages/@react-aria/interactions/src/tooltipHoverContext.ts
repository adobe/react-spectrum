import React, {MutableRefObject} from 'react';
import {TooltipHoverProps} from './useTooltipHover';

interface TooltipHoverResponderContext extends TooltipHoverProps {
  register(): void,
  ref?: MutableRefObject<HTMLElement>
}

export const TooltipHoverResponderContext = React.createContext<TooltipHoverResponderContext>(null);
