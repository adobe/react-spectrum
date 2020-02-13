import {HoverHookProps, HoverProps} from './useHover';
import {mergeProps} from '@react-aria/utils';
import React, {MutableRefObject, useContext, useEffect} from 'react';

interface DOMPropsResponderContext extends HoverProps {
  register(): void,
  ref?: MutableRefObject<HTMLElement>,
  onMouseEnter?: () => void,
  onMouseLeave?: () => void,
  onPointerEnter?: () => void,
  onPointerLeave?: () => void
}

export const DOMPropsResponderContext = React.createContext<DOMPropsResponderContext>(null);

export function useDOMPropsResponderContext(props: HoverHookProps): HoverHookProps {
  // Consume context from <DOMPropsResponder> and merge with props.
  let context = useContext(DOMPropsResponderContext);
  if (context) {
    let {register, ...contextProps} = context;
    props = mergeProps(contextProps, props) as HoverHookProps;
    register();
  }

  // Sync ref from <DOMPropsResponder> with ref passed to the useHover hook.
  useEffect(() => {
    if (context && context.ref) {
      context.ref.current = props.ref.current;
      return () => {
        context.ref.current = null;
      };
    }
  }, [context, props.ref]);

  return props;
}
