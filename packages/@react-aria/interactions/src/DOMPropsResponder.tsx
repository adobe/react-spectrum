import {HoverProps} from './useHover'; 
import {DOMPropsResponderContext} from './DOMPropsContext';
import React, {ReactNode, RefObject, useEffect, useRef} from 'react';

interface DOMPropsResponderProps extends HoverProps { // 1TODO: also extend PressProps
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

  useEffect(() => {
    if (!isRegistered.current) {
      console.warn(
        'A DOMPropsResponder was ultilized without a hoverable DOM node.'
      );
    }
  }, []);

  return (
    <DOMPropsResponderContext.Provider value={context}>
      {children}
    </DOMPropsResponderContext.Provider>
  );
});
