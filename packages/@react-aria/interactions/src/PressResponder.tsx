import {PressProps} from './usePress';
import {PressResponderContext} from './context';
import React, {ReactNode, RefObject, useEffect, useRef} from 'react';

interface PressResponderProps extends PressProps {
  children: ReactNode
}

export const PressResponder = React.forwardRef(({children, ...props}: PressResponderProps, ref: RefObject<HTMLElement>) => {
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
        'A PressResponder was rendered without a pressable child. ' +
        'Either call the usePress hook, or wrap your DOM node with <Pressable> component.'
      );
    }
  }, []);

  return (
    <PressResponderContext.Provider value={context}>
      {children}
    </PressResponderContext.Provider>
  );
});
