import {HoverProps} from './useHover';
import React, {MutableRefObject} from 'react';

interface DOMPropsResponderContext extends HoverProps {
  register(): void,
  ref?: MutableRefObject<HTMLElement>
}

export const DOMPropsResponderContext = React.createContext<DOMPropsResponderContext>(null);
