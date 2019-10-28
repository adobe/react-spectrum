import {HoverProps} from './useHover';
import React, {MutableRefObject} from 'react';

interface HoverResponderContext extends PressProps {
  register(): void,
  ref?: MutableRefObject<HTMLElement>
}

export const HoverResponderContext = React.createContext<HoverResponderContext>(null);
