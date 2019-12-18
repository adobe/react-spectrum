import {HoverProps} from './useHover';
import {HoverResponderContext} from './hoverContext';
import React, {ReactNode, RefObject, useEffect, useRef} from 'react';

interface HoverResponderProps extends HoverProps {
  children: ReactNode
}

export const HoverResponder = React.forwardRef(({children, ...props}: HoverResponderProps, ref: RefObject<HTMLElement>) => {
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
        'A HoverResponder was ultilized without a hoverable DOM node.'
      );
    }
  }, []);

  return (
    <HoverResponderContext.Provider value={context}>
      {children}
    </HoverResponderContext.Provider>
  );
});
