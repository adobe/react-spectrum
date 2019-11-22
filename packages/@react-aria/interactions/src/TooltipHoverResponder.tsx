import {TooltipHoverProps} from './useTooltipHover';
import {TooltipHoverResponderContext} from './tooltipHoverContext';
import React, {ReactNode, RefObject, useEffect, useRef} from 'react';

interface TooltipHoverResponderProps extends TooltipHoverProps {
  children: ReactNode
}

export const TooltipHoverResponder = React.forwardRef(({children, ...props}: TooltipHoverResponderProps, ref: RefObject<HTMLElement>) => {
  let isRegistered = useRef(false);
  let context = {
    ...props,
    ref,
    register() {
      isRegistered.current = true;
    }
  };

  useEffect(() => {
    if (!isRegistered.current) {
      console.warn(
        'The TooltipHoverResponder is not in sync'
      );
    }
  }, []);

  return (
    <TooltipHoverResponderContext.Provider value={context}>
      {children}
    </TooltipHoverResponderContext.Provider>
  );
});
