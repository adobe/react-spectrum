import {HoverProps} from './usePress';
import {HoverResponderContext} from './context';
import React, {ReactNode, RefObject, useEffect, useRef} from 'react';

interface HoverResponderProps extends PressProps {
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
        'A HoverResponder was rendered without a hoverable child. '
      );
    }
  }, []);

  return (
    <HoverResponderContext.Provider value={context}>
      {children}
    </HoverResponderContext.Provider>
  );
});
