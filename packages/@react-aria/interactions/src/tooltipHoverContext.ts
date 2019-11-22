import {TooltipHoverProps} from './useTooltipHover';
import React, {MutableRefObject} from 'react';

interface TooltipHoverResponderContext extends TooltipHoverProps {
  register(): void,
  ref?: MutableRefObject<HTMLElement>
}

export const TooltipHoverResponderContext = React.createContext<TooltipHoverResponderContext>(null);
