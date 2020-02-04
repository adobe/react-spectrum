import {PressProps} from './usePress';
import React, {MutableRefObject} from 'react';

interface PressResponderContext extends PressProps {
  register(): void,
  ref?: MutableRefObject<HTMLElement>
}

export const PressResponderContext = React.createContext<PressResponderContext>(null);
PressResponderContext.displayName = 'PressResponderContext';
