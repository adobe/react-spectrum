import {ContextValue, useContextProps} from './utils';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes} from 'react';

export const KeyboardContext = createContext<ContextValue<HTMLAttributes<HTMLElement>, HTMLElement>>({});

function Keyboard(props: HTMLAttributes<HTMLElement>, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, KeyboardContext);
  return <kbd dir="ltr" {...props} ref={ref} />;
}

const _Keyboard = forwardRef(Keyboard);
export {_Keyboard as Keyboard};
