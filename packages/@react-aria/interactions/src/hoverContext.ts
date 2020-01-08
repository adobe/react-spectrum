import {HoverProps} from './useHover';
import React, {MutableRefObject} from 'react';

interface HoverResponderContext extends HoverProps {
  register(): void,
  ref?: MutableRefObject<HTMLElement>
}

export const HoverResponderContext = React.createContext<HoverResponderContext>(null);
// HoverResponderContext.displayName = 'HoverResponderContext';
