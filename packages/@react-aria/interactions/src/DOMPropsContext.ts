import {HoverProps} from './useHover';
import React, {MutableRefObject} from 'react';

interface DOMPropsResponderContext extends HoverProps {
  register(): void,
  ref?: MutableRefObject<HTMLElement>,
  onMouseEnter?: () => void,
  onMouseLeave?: () => void
}

export const DOMPropsResponderContext = React.createContext<DOMPropsResponderContext>(null);
