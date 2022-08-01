import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes} from 'react';
import {useContextProps, WithRef} from './utils';

export const KeyboardContext = createContext<WithRef<HTMLAttributes<HTMLElement>, HTMLElement>>({});

function Keyboard(props: HTMLAttributes<HTMLElement>, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, KeyboardContext);
  return <kbd dir="ltr" {...props} ref={ref} />;
}

const _Keyboard = forwardRef(Keyboard);
export {_Keyboard as Keyboard};
