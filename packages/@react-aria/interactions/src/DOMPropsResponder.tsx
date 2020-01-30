// TODO: Import usePress and PressProps so this Responder can be utilized in place of the PressResponder as well
import {DOMPropsResponderContext} from './DOMPropsContext';
import {HoverProps} from './useHover';
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

  // TODO: Think of a more generic message when this replaces the PressResponder as well
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
