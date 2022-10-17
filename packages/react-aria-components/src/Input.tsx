import {ContextValue, useContextProps} from './utils';
import React, {createContext, ForwardedRef, forwardRef, InputHTMLAttributes} from 'react';

export const InputContext = createContext<ContextValue<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>>({});

function Input(props: InputHTMLAttributes<HTMLInputElement>, ref: ForwardedRef<HTMLInputElement>) {
  [props, ref] = useContextProps(props, ref, InputContext);
  return <input {...props} ref={ref} />;
}

const _Input = forwardRef(Input);
export {_Input as Input};
