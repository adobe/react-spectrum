import {HoverProps} from './useHover';
import {DOMPropsResponderContext} from './hoverContext';
import React, {ReactNode, RefObject, useEffect, useRef} from 'react';

interface DOMPropsResponderProps extends HoverProps {
  children: ReactNode
}

export const DOMPropsResponder = React.forwardRef(({children, ...props}: DOMPropsResponderProps, ref: RefObject<HTMLElement>) => {
  let isRegistered = useRef(false);
  let context = {
    ...props,
    ref,
    register() {
      isRegistered.current = true;
    }
  };

  // TODO: change to a more generic warning when we are using this for things other than hover 
  useEffect(() => {
    if (!isRegistered.current) {
      console.warn(
        'A HoverResponder was ultilized without a hoverable DOM node.'
      );
    }
  }, []);

  return (
    <DOMPropsResponderContext.Provider value={context}>
    {children}
    </DOMPropsResponderContext.Provider>
  );
});
